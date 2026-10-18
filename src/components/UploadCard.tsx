import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadCardProps {
  onPickImages: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onPickImages }) => {
  return (
    <TouchableOpacity
      style={styles.uploadCard}
      activeOpacity={0.8}
      onPress={onPickImages}
    >
      <View style={styles.uploadIconContainer}>
        <Ionicons name="cloud-upload-outline" size={44} color="#3B82F6" />
      </View>
      <Text style={styles.uploadTitle}>Select Image(s) as Input</Text>
      <Text style={styles.uploadSubtitle}>
        Tap to choose single or multiple images to compress and save directly into your &quot;Image Compressor&quot; folder
      </Text>
      <View style={styles.selectButton}>
        <Ionicons name="images-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.selectButtonText}>Choose from Gallery</Text>
      </View>
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#2563EB',
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
});
