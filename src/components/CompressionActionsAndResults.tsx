import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompressionResult } from '@/types/image-compressor';
import { formatFileSize } from '@/services/image-compression';

interface CompressionActionsAndResultsProps {
  imageCount: number;
  isProcessing: boolean;
  progressText: string;
  isSaving: boolean;
  saveProgress: number;
  saveProgressText: string;
  result: CompressionResult | null;
  onCompress: () => void;
  onSave: () => void;
}

export const CompressionActionsAndResults: React.FC<CompressionActionsAndResultsProps> = ({
  imageCount,
  isProcessing,
  progressText,
  isSaving,
  saveProgress,
  saveProgressText,
  result,
  onCompress,
  onSave,
}) => {
  return (
    <View style={styles.container}>
      {/* Output format hint */}
      <View style={styles.outputHintCard}>
        <Ionicons
          name="images-outline"
          size={22}
          color="#93C5FD"
        />
        <Text style={styles.outputHintText}>
          {imageCount === 1
            ? 'Output: Single optimized JPEG file saved directly to folder'
            : `Output: ${imageCount} individual optimized JPEG photos saved directly to "Image Compressor" folder`}
        </Text>
      </View>

      {/* Compress Button */}
      {!result && (
        <TouchableOpacity
          style={[styles.compressButton, isProcessing && styles.compressButtonDisabled]}
          onPress={onCompress}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.compressButtonText}>{progressText || 'Compressing...'}</Text>
            </View>
          ) : (
            <View style={styles.processingRow}>
              <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.compressButtonText}>
                {imageCount === 1 ? 'Compress Image' : `Compress All (${imageCount}) Images`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Result Card */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultIconBg}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#34D399"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle}>
                {result.type === 'single'
                  ? 'JPEG Compression Complete!'
                  : `All ${result.items.length} Photos Compressed!`}
              </Text>
              <Text style={styles.resultSubtitle}>
                {result.type === 'single'
                  ? 'Optimized JPEG ready for saving'
                  : `All ${result.items.length} photos ready to save into "Image Compressor" folder`}
              </Text>
            </View>
          </View>

          {/* Size Comparison */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Original Total</Text>
              <Text style={styles.statValueOld}>
                {formatFileSize(result.totalOriginalSize)}
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={18} color="#64748B" />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Compressed Total</Text>
              <Text style={styles.statValueNew}>
                {formatFileSize(result.totalCompressedSize)}
              </Text>
            </View>

            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>-{result.reductionPercentage}%</Text>
            </View>
          </View>

          {/* Save Progress Bar */}
          {isSaving && (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabelText}>
                  {saveProgressText || 'Saving to "Image Compressor"...'}
                </Text>
                <Text style={styles.progressPercentText}>
                  {Math.round(saveProgress * 100)}%
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(5, Math.min(100, Math.round(saveProgress * 100)))}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            onPress={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.savingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {saveProgressText || 'Saving Photos...'}
                </Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name={Platform.OS === 'android' ? 'save-outline' : 'share-outline'}
                  size={22}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveButtonText}>
                  {result.type === 'single'
                    ? 'Save Photo to Folder'
                    : `Save All (${result.items.length}) to Folder`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  outputHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  outputHintText: {
    flex: 1,
    color: '#93C5FD',
    fontSize: 12,
    lineHeight: 18,
  },
  compressButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  compressButtonDisabled: {
    opacity: 0.65,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compressButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 18,
    gap: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValueOld: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    textDecorationLine: 'line-through',
  },
  statValueNew: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34D399',
  },
  savingsBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
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
