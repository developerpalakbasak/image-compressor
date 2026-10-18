import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cleanCacheDirectory, compressImages, deleteDirectorySafely } from '@/services/image-compression';
import { getSavedFolderUri, saveResultToFileManager } from '@/services/storage';
import { CompressionResult, SelectedImage } from '@/types/image-compressor';

import { CompressionActionsAndResults } from '@/components/CompressionActionsAndResults';
import { Header } from '@/components/Header';
import { QualitySlider } from '@/components/QualitySlider';
import { SelectedImagesPreview } from '@/components/SelectedImagesPreview';
import { UploadCard } from '@/components/UploadCard';

export default function HomeScreen() {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [quality, setQuality] = useState<number>(75);

  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionProgress, setSelectionProgress] = useState<number>(0);
  const [selectionProgressText, setSelectionProgressText] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('');
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [savedFolderUri, setSavedFolderUri] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [saveProgressText, setSaveProgressText] = useState<string>('');

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { });
    cleanCacheDirectory();
    getSavedFolderUri().then((uri) => {
      if (uri) setSavedFolderUri(uri);
    });
  }, []);

  const handlePickImages = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSelecting(true);
        setSelectionProgress(0.05);
        setSelectionProgressText(`Loading ${result.assets.length} image${result.assets.length > 1 ? 's' : ''}...`);

        // Give the UI a frame to render the progress bar
        await new Promise((resolve) => setTimeout(resolve, 150));

        const picked: SelectedImage[] = [];

        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];
          const currentStep = i + 1;
          const ratio = currentStep / result.assets.length;
          setSelectionProgress(ratio);
          setSelectionProgressText(`Processing image ${currentStep} of ${result.assets.length}...`);

          let fileSize = asset.size;

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

          // DocumentPicker preserves the true original filename in asset.name
          const originalName = asset.name || `image_${i + 1}.jpg`;

          picked.push({
            id: `${Date.now()}_${i}`,
            uri: asset.uri,
            name: originalName,
            originalSize: fileSize,
          });

          // Allow the UI thread to update progress smoothly
          await new Promise((resolve) => setTimeout(resolve, 60));
        }

        setSelectionProgress(1);
        setSelectionProgressText('Complete!');
        await new Promise((resolve) => setTimeout(resolve, 120));

        if (compressedResult?.outputDirectoryUri) {
          deleteDirectorySafely(compressedResult.outputDirectoryUri);
        }
        setImages(picked);
        setCompressedResult(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to pick images');
    } finally {
      setIsSelecting(false);
      setSelectionProgress(0);
      setSelectionProgressText('');
    }
  };

  const handleCompress = async () => {
    if (images.length === 0) return;

    if (compressedResult?.outputDirectoryUri) {
      deleteDirectorySafely(compressedResult.outputDirectoryUri);
    }

    setIsProcessing(true);
    setCompressProgress(0);
    setProgressText('Starting compression...');
    setCompressedResult(null);

    try {
      const result = await compressImages(images, quality, (prog, text) => {
        setCompressProgress(prog);
        setProgressText(text);
      });
      setCompressedResult(result);
    } catch (err: any) {
      Alert.alert('Compression Error', err.message || 'Error occurred while compressing images');
    } finally {
      setIsProcessing(false);
      setCompressProgress(0);
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
      // Once successfully saved, reset back to primary screen
      setCompressedResult(null);
      setImages([]);
      cleanCacheDirectory();
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
          <UploadCard
            onPickImages={handlePickImages}
            isSelecting={isSelecting}
            selectionProgress={selectionProgress}
            selectionProgressText={selectionProgressText}
          />
        ) : (
          <View style={styles.activeContainer}>
            <SelectedImagesPreview
              images={images}
              onReset={handleReset}
              isSelecting={isSelecting}
              selectionProgress={selectionProgress}
              selectionProgressText={selectionProgressText}
            />

            <QualitySlider quality={quality} onQualityChange={(val) => setQuality(val)} />

            <CompressionActionsAndResults
              imageCount={images.length}
              isProcessing={isProcessing}
              progressText={progressText}
              compressProgress={compressProgress}
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
