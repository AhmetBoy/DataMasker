import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = React.useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/pdf'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];

        // Check if it's an image file
        if (file.mimeType && file.mimeType.startsWith('image/')) {
          Alert.alert(
            'Desteklenmeyen Dosya Türü',
            'Görsel dosyaları henüz desteklenmiyor. Lütfen metin tabanlı bir dosya seçin (PDF, Word, Text).',
            [{ text: 'Tamam' }]
          );
          return;
        }

        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Hata',
        'Dosya seçilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleStart = () => {
    if (selectedFile) {
      navigation.navigate('MaskingOptions', { file: selectedFile });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KVKK Data Masker</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Upload Area */}
        <TouchableOpacity
          style={styles.uploadArea}
          onPress={pickDocument}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7D5FFF', '#B34BFF', '#FF33A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.uploadContent}>
              {/* Animated Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={80} color="#B34BFF" />
                <Ionicons
                  name="search"
                  size={40}
                  color="#7D5FFF"
                  style={styles.searchIcon}
                />
              </View>

              <Text style={styles.uploadTitle}>
                Dosyanızı Yüklemek İçin Dokunun
              </Text>
              <Text style={styles.uploadSubtitle}>
                Excel • Word • PDF • Text
              </Text>

              {selectedFile && (
                <View style={styles.fileInfo}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Privacy Assurance */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#f4259d" />
          </View>
          <Text style={styles.privacyText}>
            Tüm işlemler CİHAZINIZDA gerçekleşir. Hiçbir veri saklanmaz.
          </Text>
        </View>
      </View>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedFile && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!selectedFile}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedFile ? ['#7D5FFF', '#B34BFF', '#FF33A8'] : ['#ccc', '#aaa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Maskelemeye Başla →</Text>
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
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d1d33',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadArea: {
    width: width - 48,
    maxWidth: 400,
    marginBottom: 32,
  },
  gradientBorder: {
    padding: 4,
    borderRadius: 32,
    shadowColor: '#B34BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  uploadContent: {
    backgroundColor: '#f8f5f7',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  searchIcon: {
    position: 'absolute',
    bottom: -5,
    right: -10,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d1d33',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#694b5f',
    textAlign: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    maxWidth: 200,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 37, 157, 0.1)',
    borderRadius: 16,
    padding: 16,
    width: width - 48,
    maxWidth: 400,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 37, 157, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#3d1d33',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  startButton: {
    width: width - 48,
    maxWidth: 400,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
