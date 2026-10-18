import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectedImage } from '@/types/image-compressor';
import { formatFileSize } from '@/services/image-compression';

interface SelectedImagesPreviewProps {
  images: SelectedImage[];
  onReset: () => void;
}

export const SelectedImagesPreview: React.FC<SelectedImagesPreviewProps> = ({ images, onReset }) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="images" size={18} color="#60A5FA" />
          <Text style={styles.sectionTitle}>
            {images.length === 1 ? '1 Image Selected' : `${images.length} Images Selected`}
          </Text>
        </View>
        <TouchableOpacity onPress={onReset} style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Reset / Re-pick</Text>
        </TouchableOpacity>
      </View>

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
    color: '#60A5FA',
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
});
