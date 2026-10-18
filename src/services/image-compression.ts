import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { SelectedImage, CompressionResult, CompressedFileItem } from '@/types/image-compressor';

export const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const cleanCacheDirectory = async (): Promise<void> => {
  try {
    if (!FileSystem.cacheDirectory) return;
    const contents = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
    for (const item of contents) {
      if (
        item.startsWith('compressed_') ||
        item === 'ImageManipulator' ||
        item === 'ImagePicker'
      ) {
        await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${item}`, { idempotent: true });
      }
    }
  } catch {
    // Non-blocking cleanup
  }
};

export const deleteDirectorySafely = async (dirUri?: string): Promise<void> => {
  if (!dirUri) return;
  try {
    await FileSystem.deleteAsync(dirUri, { idempotent: true });
  } catch {
    // Non-blocking
  }
};

export const compressImages = async (
  images: SelectedImage[],
  quality: number,
  onProgress?: (progress: number, text: string) => void
): Promise<CompressionResult> => {
  const compressedFiles: CompressedFileItem[] = [];
  const timestamp = Date.now();
  const outputDir = `${FileSystem.cacheDirectory}compressed_${timestamp}/`;

  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

  let totalOrigSize = 0;
  let totalCompSize = 0;
  const nameCounts: Record<string, number> = {};

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const progressRatio = (i + 1) / images.length;
    onProgress?.(progressRatio, `Compressing image ${i + 1} of ${images.length}...`);

    totalOrigSize += img.originalSize || 0;

    const compressRatio = Math.max(0.01, Math.min(1.0, quality / 100));
    const manipulated = await ImageManipulator.manipulateAsync(
      img.uri,
      [],
      {
        compress: compressRatio,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Keep original file base name
    const rawName = img.name ? img.name.replace(/\.[^/.]+$/, '').trim() : `image`;
    const cleanBaseName = rawName || `image_${i + 1}`;

    // Handle duplicate names with serial numbers: name.jpg, name (1).jpg, name (2).jpg
    let finalBaseName: string;
    if (nameCounts[cleanBaseName] === undefined) {
      nameCounts[cleanBaseName] = 0;
      finalBaseName = cleanBaseName;
    } else {
      nameCounts[cleanBaseName] += 1;
      finalBaseName = `${cleanBaseName} (${nameCounts[cleanBaseName]})`;
    }

    const destFileName = `${finalBaseName}.jpg`;
    const destPath = `${outputDir}${destFileName}`;

    // Move rather than copy to prevent keeping duplicates in cache
    try {
      await FileSystem.moveAsync({ from: manipulated.uri, to: destPath });
    } catch {
      await FileSystem.copyAsync({ from: manipulated.uri, to: destPath });
      await FileSystem.deleteAsync(manipulated.uri, { idempotent: true }).catch(() => {});
    }

    const info = await FileSystem.getInfoAsync(destPath);
    const compSize = (info.exists && 'size' in info) ? (info.size || 0) : 0;
    totalCompSize += compSize;

    compressedFiles.push({
      uri: destPath,
      size: compSize,
      name: destFileName,
    });
  }

  const savedPercent = totalOrigSize > 0
    ? Math.max(0, Math.round(((totalOrigSize - totalCompSize) / totalOrigSize) * 100))
    : 0;

  return {
    type: images.length === 1 ? 'single' : 'multiple',
    items: compressedFiles,
    totalOriginalSize: totalOrigSize,
    totalCompressedSize: totalCompSize,
    reductionPercentage: savedPercent,
    outputDirectoryUri: outputDir,
  };
};
