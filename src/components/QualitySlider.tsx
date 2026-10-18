import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface QualitySliderProps {
  quality: number;
  onQualityChange: (value: number) => void;
}

export const QualitySlider: React.FC<QualitySliderProps> = ({ quality, onQualityChange }) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="options-outline" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Compression Quality</Text>
        </View>
        <View style={styles.qualityPill}>
          <Text style={styles.qualityPillText}>{quality}%</Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderScaleRow}>
          <Text style={styles.sliderMinText}>1% (Smallest)</Text>
          <Text style={styles.sliderMaxText}>100% (Lossless-like)</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={quality}
          onValueChange={onQualityChange}
          minimumTrackTintColor="#10B981"
          maximumTrackTintColor="#334155"
          thumbTintColor="#10B981"
        />
      </View>
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
  qualityPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  qualityPillText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  sliderContainer: {
    paddingVertical: 4,
  },
  sliderScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sliderMinText: {
    fontSize: 11,
    color: '#64748B',
  },
  sliderMaxText: {
    fontSize: 11,
    color: '#64748B',
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
