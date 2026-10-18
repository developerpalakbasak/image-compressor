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
  let targetDirUri = currentFolderUri;

  if (!targetDirUri) {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      Alert.alert(
        'Permission Denied',
        'Permission is required to create the "Image Compressor" folder and save your photos.'
      );
      return null;
    }

    const rootUri = permissions.directoryUri;

    try {
      const filesInRoot = await FileSystem.StorageAccessFramework.readDirectoryAsync(rootUri);
      const existingFolder = filesInRoot.find((uri) =>
        decodeURIComponent(uri).endsWith('/Image Compressor') ||
        decodeURIComponent(uri).endsWith('%2FImage%20Compressor') ||
        decodeURIComponent(uri).includes('Image Compressor')
      );

      if (existingFolder) {
        targetDirUri = existingFolder;
      } else {
        targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
          rootUri,
          'Image Compressor'
        );
      }
    } catch {
      try {
        targetDirUri = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
          rootUri,
          'Image Compressor'
        );
      } catch {
        targetDirUri = rootUri;
      }
    }

    if (targetDirUri) {
      onFolderUriUpdated(targetDirUri);
      await persistFolderUri(targetDirUri);
    }
  }

  return targetDirUri;
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

    let savedCount = 0;
    const total = result.items.length;

    for (let i = 0; i < total; i++) {
      const item = result.items[i];
      onProgress?.((i / total), `Saving ${i + 1} of ${total}...`);

      const fileContentBase64 = await FileSystem.readAsStringAsync(item.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileNameWithoutExt = item.name.replace(/\.[^/.]+$/, '');
      let destinationFileUri: string;

      try {
        destinationFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          fileNameWithoutExt,
          'image/jpeg'
        );
      } catch {
        // If directory permission expired or folder was removed, prompt again
        targetDirUri = await resolveTargetFolderUri(null, onFolderUriUpdated);
        if (!targetDirUri) return;

        destinationFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          targetDirUri,
          fileNameWithoutExt,
          'image/jpeg'
        );
      }

      await FileSystem.writeAsStringAsync(destinationFileUri, fileContentBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      savedCount++;
      onProgress?.((savedCount / total), `Saved ${savedCount} of ${total}`);
    }

    if (result.type === 'single') {
      Alert.alert(
        'Saved Successfully!',
        `Photo has been saved to the "Image Compressor" folder.`
      );
    } else {
      Alert.alert(
        'Saved All Successfully!',
        `All ${savedCount} compressed photos have been saved to the "Image Compressor" folder.`
      );
    }
  } else {
    // iOS and other platforms
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      const total = result.items.length;
      for (let i = 0; i < total; i++) {
        const item = result.items[i];
        onProgress?.(((i + 1) / total), `Sharing ${i + 1} of ${total}...`);
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
  }
};
