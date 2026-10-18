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

export const compressImages = async (
  images: SelectedImage[],
  quality: number,
  onProgress?: (text: string) => void
): Promise<CompressionResult> => {
  const compressedFiles: CompressedFileItem[] = [];
  const timestamp = Date.now();
  const outputDir = `${FileSystem.cacheDirectory}compressed_${timestamp}/`;

  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

  let totalOrigSize = 0;
  let totalCompSize = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    onProgress?.(`Compressing ${i + 1} of ${images.length}...`);

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

    const baseName = img.name ? img.name.replace(/\.[^/.]+$/, '') : `image_${i + 1}`;
    const destFileName = `${baseName}_compressed_${timestamp}_${i + 1}.jpg`;
    const destPath = `${outputDir}${destFileName}`;
    await FileSystem.copyAsync({ from: manipulated.uri, to: destPath });

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
  };
};
