import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SplashScreen from 'expo-splash-screen';

import { SelectedImage, CompressionResult } from '@/types/image-compressor';
import { compressImages, cleanCacheDirectory, deleteDirectorySafely } from '@/services/image-compression';
import { getSavedFolderUri, saveResultToFileManager } from '@/services/storage';

import { Header } from '@/components/Header';
import { UploadCard } from '@/components/UploadCard';
import { SelectedImagesPreview } from '@/components/SelectedImagesPreview';
import { QualitySlider } from '@/components/QualitySlider';
import { CompressionActionsAndResults } from '@/components/CompressionActionsAndResults';

export default function HomeScreen() {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [quality, setQuality] = useState<number>(75);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [savedFolderUri, setSavedFolderUri] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [saveProgressText, setSaveProgressText] = useState<string>('');

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    cleanCacheDirectory();
    getSavedFolderUri().then((uri) => {
      if (uri) setSavedFolderUri(uri);
    });
  }, []);

  const handlePickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked: SelectedImage[] = [];

        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];
          let fileSize = asset.fileSize;

          if (!fileSize) {
            try {
              const info = await FileSystem.getInfoAsync(asset.uri);
              if (info.exists && 'size' in info) {
                fileSize = info.size;
              }
            } catch {
              // Ignore fallback error
            }
          }

          picked.push({
            id: `${Date.now()}_${i}`,
            uri: asset.uri,
            name: asset.fileName || `image_${i + 1}.jpg`,
            originalSize: fileSize,
            width: asset.width,
            height: asset.height,
          });
        }

        if (compressedResult?.outputDirectoryUri) {
          deleteDirectorySafely(compressedResult.outputDirectoryUri);
        }
        setImages(picked);
        setCompressedResult(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pick images');
    }
  };

  const handleCompress = async () => {
    if (images.length === 0) return;

    if (compressedResult?.outputDirectoryUri) {
      deleteDirectorySafely(compressedResult.outputDirectoryUri);
    }

    setIsProcessing(true);
    setCompressedResult(null);

    try {
      const result = await compressImages(images, quality, (text) => setProgressText(text));
      setCompressedResult(result);
    } catch (err: any) {
      Alert.alert('Compression Error', err.message || 'Error occurred while compressing images');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleSave = async () => {
    if (!compressedResult) return;

    setIsSaving(true);
    setSaveProgress(0);
    setSaveProgressText('Preparing files...');

    try {
      await saveResultToFileManager(
        compressedResult,
        savedFolderUri,
        (newUri) => setSavedFolderUri(newUri),
        (prog, text) => {
          setSaveProgress(prog);
          setSaveProgressText(text);
        }
      );
      // Once saved, temporary files were deleted by saveResultToFileManager, clear result state
      setCompressedResult(null);
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Could not save file to file manager');
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
      setSaveProgressText('');
    }
  };

  const handleReset = () => {
    if (compressedResult?.outputDirectoryUri) {
      deleteDirectorySafely(compressedResult.outputDirectoryUri);
    }
    setImages([]);
    setCompressedResult(null);
    cleanCacheDirectory();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {images.length === 0 ? (
          <UploadCard onPickImages={handlePickImages} />
        ) : (
          <View style={styles.activeContainer}>
            <SelectedImagesPreview images={images} onReset={handleReset} />

            <QualitySlider quality={quality} onQualityChange={(val) => setQuality(val)} />

            <CompressionActionsAndResults
              imageCount={images.length}
              isProcessing={isProcessing}
              progressText={progressText}
              isSaving={isSaving}
              saveProgress={saveProgress}
              saveProgressText={saveProgressText}
              result={compressedResult}
              onCompress={handleCompress}
              onSave={handleSave}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  activeContainer: {
    gap: 16,
  },
});
