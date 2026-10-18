import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadCardProps {
  onPickImages: () => void;
  isSelecting?: boolean;
  selectionProgress?: number;
  selectionProgressText?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onPickImages,
  isSelecting = false,
  selectionProgress = 0,
  selectionProgressText = '',
}) => {
  return (
    <TouchableOpacity
      style={styles.uploadCard}
      activeOpacity={0.8}
      onPress={onPickImages}
      disabled={isSelecting}
    >
      <View style={styles.uploadIconContainer}>
        {isSelecting ? (
          <ActivityIndicator size="large" color="#10B981" />
        ) : (
          <Ionicons name="cloud-upload-outline" size={44} color="#10B981" />
        )}
      </View>
      <Text style={styles.uploadTitle}>
        {isSelecting ? 'Loading Selected Images...' : 'Select Image(s) as Input'}
      </Text>
      <Text style={styles.uploadSubtitle}>
        {isSelecting
          ? selectionProgressText || 'Reading image metadata and preparing files...'
          : 'Tap to choose single or multiple images to compress and save directly into your "Image Compressor" folder'}
      </Text>

      {/* Progress Bar when selecting */}
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

      {!isSelecting && (
        <View style={styles.selectButton}>
          <Ionicons name="images-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.selectButtonText}>Choose from Gallery</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  uploadCard: {
    marginTop: 36,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
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
