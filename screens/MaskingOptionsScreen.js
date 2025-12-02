import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MaskingOptionsScreen({ route, navigation }) {
  const { file } = route.params;

  const [maskingOptions, setMaskingOptions] = useState({
    tc: true,
    phone: true,
    email: true,
    iban: true,
    name: true,
    address: true,
    creditCard: false,
    birthDate: false,
    passport: false,
    taxNumber: false,
  });

  const toggleOption = (key) => {
    setMaskingOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScan = () => {
    navigation.navigate('FileContentTest', {
      file,
      maskingOptions,
    });
  };

  const options = [
    { key: 'tc', label: 'T.C. Kimlik No', icon: 'card' },
    { key: 'phone', label: 'Telefon Numaraları', icon: 'call' },
    { key: 'email', label: 'E-posta Adresleri', icon: 'mail' },
    { key: 'iban', label: 'IBAN Numaraları', icon: 'card-outline' },
    { key: 'name', label: 'Ad Soyad', icon: 'person' },
    { key: 'address', label: 'Adresler', icon: 'home' },
    { key: 'creditCard', label: 'Kredi Kartı', icon: 'card' },
    { key: 'birthDate', label: 'Doğum Tarihi', icon: 'calendar' },
    { key: 'passport', label: 'Pasaport No', icon: 'airplane' },
    { key: 'taxNumber', label: 'Vergi No', icon: 'receipt' },
  ];

  const formatFileSize = (bytes) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#181114" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* File Info Card */}
        <View style={styles.fileCardContainer}>
          <LinearGradient
            colors={['#f78ca0', '#fd868c', '#fe9a8b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fileCard}
          >
            <View style={styles.fileIconContainer}>
              <Ionicons name="document-text" size={48} color="#fff" />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileSize}>
              {file.mimeType?.split('/')[1]?.toUpperCase() || 'Document'} • {formatFileSize(file.size)}
            </Text>
          </LinearGradient>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Neyin Maskeleneceğini Seç</Text>

        {/* Masking Options - 2 Column Grid */}
        <View style={styles.optionsGrid}>
          {options.map((option) => (
            <View key={option.key} style={styles.optionCard}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon} size={20} color="#181114" />
              </View>
              <Text style={styles.optionLabel} numberOfLines={2}>
                {option.label}
              </Text>
              <Switch
                value={maskingOptions[option.key]}
                onValueChange={() => toggleOption(option.key)}
                trackColor={{ false: '#e8e0e3', true: '#f4258c' }}
                thumbColor="#fff"
                ios_backgroundColor="#e8e0e3"
                style={styles.switch}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Scan Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f78ca0', '#fd868c', '#fe9a8b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanButtonGradient}
          >
            <Text style={styles.scanButtonText}>İçeriği Kontrol Et</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f7',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fileCardContainer: {
    marginBottom: 32,
  },
  fileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#f78ca0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181114',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f0f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#181114',
    textAlign: 'center',
    marginBottom: 12,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
    backgroundColor: '#f8f5f7',
  },
  scanButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#f78ca0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
