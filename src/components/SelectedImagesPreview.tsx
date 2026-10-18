import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectedImage } from '@/types/image-compressor';
import { formatFileSize } from '@/services/image-compression';

interface SelectedImagesPreviewProps {
  images: SelectedImage[];
  onReset: () => void;
  isSelecting?: boolean;
  selectionProgress?: number;
  selectionProgressText?: string;
}

export const SelectedImagesPreview: React.FC<SelectedImagesPreviewProps> = ({
  images,
  onReset,
  isSelecting = false,
  selectionProgress = 0,
  selectionProgressText = '',
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="images" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>
            {images.length === 1 ? '1 Image Selected' : `${images.length} Images Selected`}
          </Text>
        </View>
        <TouchableOpacity onPress={onReset} style={styles.changeButton} disabled={isSelecting}>
          <Text style={styles.changeButtonText}>Reset / Re-pick</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar when re-picking or processing images */}
      {isSelecting && (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabelText}>
              {selectionProgressText || 'Processing selected files...'}
            </Text>
            <Text style={styles.progressPercentText}>
              {Math.round(selectionProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(5, Math.min(100, Math.round(selectionProgress * 100)))}%` },
              ]}
            />
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
        {images.map((img, idx) => (
          <View key={img.id} style={styles.thumbnailWrapper}>
            <Image source={{ uri: img.uri }} style={styles.thumbnailImage} />
            <View style={styles.thumbnailBadge}>
              <Text style={styles.thumbnailIndex}>{idx + 1}</Text>
            </View>
            <Text style={styles.thumbnailSize} numberOfLines={1}>
              {formatFileSize(img.originalSize)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailList: {
    gap: 12,
    paddingVertical: 4,
  },
  thumbnailWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  thumbnailIndex: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  thumbnailSize: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    flex: 1,
    marginRight: 8,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34D399',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
});
