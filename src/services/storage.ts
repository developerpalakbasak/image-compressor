import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { CompressionResult } from '@/types/image-compressor';

const FOLDER_CONFIG_URI = `${FileSystem.documentDirectory}save_folder_config.txt`;

export const getSavedFolderUri = async (): Promise<string | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(FOLDER_CONFIG_URI);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(FOLDER_CONFIG_URI);
      if (content && content.trim()) {
        return content.trim();
      }
    }
  } catch {
    // Return null if reading fails
  }
  return null;
};

export const persistFolderUri = async (uri: string): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(FOLDER_CONFIG_URI, uri);
  } catch {
    // Non-blocking
  }
};

const resolveTargetFolderUri = async (
  currentFolderUri: string | null,
  onFolderUriUpdated: (newUri: string) => void
): Promise<string | null> => {
  // If we already have a saved folder uri, test if it is still accessible
  if (currentFolderUri) {
    try {
      await FileSystem.StorageAccessFramework.readDirectoryAsync(currentFolderUri);
      return currentFolderUri;
    } catch {
      // Permission expired or folder was deleted, will re-request below
    }
  }

  // Request permission with initial directory pointing to Pictures
  let initialUri: string | undefined;
  try {
    initialUri = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Pictures');
  } catch {
    initialUri = undefined;
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

  if (!permissions.granted) {
    Alert.alert(
      'Permission Denied',
      'Storage permission is required to save photos directly to Pictures > Image Compressor.'
    );
    return null;
  }

  const chosenUri = permissions.directoryUri;
  let targetDirUri = chosenUri;

  // If user selected Pictures root (or another folder), create / find "Image Compressor" folder inside it
  const decodedUri = decodeURIComponent(chosenUri);
  const isAlreadyImageCompressor =
    decodedUri.endsWith('/Image Compressor') ||
    decodedUri.endsWith('%2FImage%20Compressor') ||
    decodedUri.endsWith('Image Compressor');

  if (!isAlreadyImageCompressor) {
    try {
      const existingEntries = await FileSystem.StorageAccessFramework.readDirectoryAsync(chosenUri);
      const existingSubfolder = existingEntries.find((entry) => {
        const decoded = decodeURIComponent(entry);
        return decoded.endsWith('/Image Compressor') || decoded.endsWith('%2FImage%20Compressor') || decoded.includes('Image Compressor');
      });

      if (existingSubfolder) {
        targetDirUri = existingSubfolder;
      } else {
        targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
          chosenUri,
          'Image Compressor'
        );
      }
    } catch {
      targetDirUri = chosenUri;
    }
  }

  if (targetDirUri) {
    onFolderUriUpdated(targetDirUri);
    await persistFolderUri(targetDirUri);
  }

  return targetDirUri;
};

/**
 * Checks existing files in destination directory and returns a non-colliding filename.
 * If 'photo.jpg' exists, returns 'photo (1)', 'photo (2)', etc. (without extension for SAF).
 */
const getUniqueBaseName = (
  baseName: string,
  existingNames: Set<string>
): string => {
  let candidate = baseName;
  let counter = 1;

  while (existingNames.has(candidate.toLowerCase())) {
    candidate = `${baseName} (${counter})`;
    counter++;
  }

  existingNames.add(candidate.toLowerCase());
  return candidate;
};

export const saveResultToFileManager = async (
  result: CompressionResult,
  cachedSavedFolderUri: string | null,
  onFolderUriUpdated: (newUri: string) => void,
  onProgress?: (progress: number, text: string) => void
): Promise<void> => {
  if (Platform.OS === 'android') {
    let targetDirUri = await resolveTargetFolderUri(cachedSavedFolderUri, onFolderUriUpdated);

    if (!targetDirUri) {
      return;
    }

    // Read existing files in destination to avoid overwriting or duplicated names
    const existingFileNames = new Set<string>();
    try {
      const filesInDir = await FileSystem.StorageAccessFramework.readDirectoryAsync(targetDirUri);
      for (const fileUri of filesInDir) {
        const decoded = decodeURIComponent(fileUri);
        const segments = decoded.split('/');
        const lastSegment = segments[segments.length - 1] || '';
        // Extract base name without .jpg/.jpeg
        const nameWithoutExt = lastSegment.replace(/\.[^/.]+$/, '').trim().toLowerCase();
        if (nameWithoutExt) {
          existingFileNames.add(nameWithoutExt);
        }
      }
    } catch {
      // Continue even if listing directory fails
    }

    let savedCount = 0;
    const total = result.items.length;

    for (let i = 0; i < total; i++) {
      const item = result.items[i];
      onProgress?.(i / total, `Saving ${i + 1} of ${total}...`);

      const fileContentBase64 = await FileSystem.readAsStringAsync(item.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const rawBaseName = item.name.replace(/\.[^/.]+$/, '').trim() || `image_${i + 1}`;
      const uniqueBaseName = getUniqueBaseName(rawBaseName, existingFileNames);

      let destinationFileUri: string;
      try {
        destinationFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          uniqueBaseName,
          'image/jpeg'
        );
      } catch {
        // If directory permission was revoked or folder deleted, re-resolve once
        targetDirUri = await resolveTargetFolderUri(null, onFolderUriUpdated);
        if (!targetDirUri) return;

        destinationFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          uniqueBaseName,
          'image/jpeg'
        );
      }

      await FileSystem.writeAsStringAsync(destinationFileUri, fileContentBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      savedCount++;
      onProgress?.(savedCount / total, `Saved ${savedCount} of ${total}`);
    }

    // Automatically delete temporary compressed files/folder after saving
    if (result.outputDirectoryUri) {
      await FileSystem.deleteAsync(result.outputDirectoryUri, { idempotent: true }).catch(() => {});
    } else {
      for (const item of result.items) {
        await FileSystem.deleteAsync(item.uri, { idempotent: true }).catch(() => {});
      }
    }

    if (result.type === 'single') {
      Alert.alert(
        'Saved Successfully!',
        'Photo has been saved to Pictures > Image Compressor.'
      );
    } else {
      Alert.alert(
        'Saved All Successfully!',
        `All ${savedCount} photos saved to Pictures > Image Compressor.`
      );
    }
  } else {
    // iOS and other platforms
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      const total = result.items.length;
      for (let i = 0; i < total; i++) {
        const item = result.items[i];
        onProgress?.((i + 1) / total, `Sharing ${i + 1} of ${total}...`);
        await Sharing.shareAsync(item.uri, {
          dialogTitle: `Save ${item.name}`,
          mimeType: 'image/jpeg',
          UTI: 'public.jpeg',
        });
      }
    } else {
      Alert.alert(
        'Saved',
        `Photos saved to cache at:\n${result.items.map((i) => i.uri).join('\n')}`
      );
    }

    // Clean up temporary files on other platforms after sharing
    if (result.outputDirectoryUri) {
      await FileSystem.deleteAsync(result.outputDirectoryUri, { idempotent: true }).catch(() => {});
    }
  }
};
