import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';

export const Header: React.FC = () => {
  const handleOpenPortfolio = () => {
    Linking.openURL('https://developerpalakbasak.vercel.app/').catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={styles.appTitle}>Image Compressor</Text>
          <TouchableOpacity onPress={handleOpenPortfolio} activeOpacity={0.7}>
            <Text style={styles.appSubtitle}>
              Developed by <Text style={styles.appSubtitleHighlight}>developerpalakbasak</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    overflow: 'hidden',
  },
  logoIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  appSubtitleHighlight: {
    color: '#10B981',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34D399',
  },
});
