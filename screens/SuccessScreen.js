import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { maskContent } from '../utils/dataDetection';
import { writeDOCXFile, writeXLSXFile, writePDFFile } from '../utils/fileParser';

const { width } = Dimensions.get('window');

export default function SuccessScreen({ route, navigation }) {
  const { file, fileContent, detectedData, selectedItems } = route.params;

  const [maskedContent, setMaskedContent] = useState('');
  const [maskedFileName, setMaskedFileName] = useState('');

  useEffect(() => {
    applyMasking();
  }, []);

  const applyMasking = () => {
    const masked = maskContent(fileContent, detectedData, selectedItems);
    setMaskedContent(masked);

    const originalName = file.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = originalName.split('.').pop().toLowerCase();

    // Keep the original file extension for Word, Excel and PDF files
    if (extension === 'docx' || extension === 'doc') {
      setMaskedFileName(`masked_${nameWithoutExt}.docx`);
    } else if (extension === 'xlsx' || extension === 'xls') {
      setMaskedFileName(`masked_${nameWithoutExt}.xlsx`);
    } else if (extension === 'pdf') {
      setMaskedFileName(`masked_${nameWithoutExt}.pdf`);
    } else {
      setMaskedFileName(`masked_${nameWithoutExt}.txt`);
    }
  };

  const handleDownload = async () => {
    try {
      let fileUri;
      const extension = file.name.split('.').pop().toLowerCase();

      // Handle different file types
      if (extension === 'docx' || extension === 'doc') {
        // Save as Word document
        fileUri = await writeDOCXFile(file.uri, maskedContent, maskedFileName);
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Save as Excel file
        fileUri = await writeXLSXFile(file.uri, maskedContent, maskedFileName);
      } else if (extension === 'pdf') {
        // Save as PDF file
        fileUri = await writePDFFile(file.uri, maskedContent, maskedFileName);
      } else {
        // Save as text file
        fileUri = FileSystem.documentDirectory + maskedFileName;
        await FileSystem.writeAsStringAsync(fileUri, maskedContent);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Başarılı', 'Dosya kaydedildi: ' + fileUri);
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Hata', 'Dosya paylaşılırken bir hata oluştu: ' + error.message);
    }
  };

  const handleNewFile = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const getPreviewText = () => {
    const lines = maskedContent.split('\n').slice(0, 8);
    return lines.join('\n').substring(0, 400) + '...';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <View style={styles.glowEffect} />
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Başarılı!</Text>
          <Text style={styles.successSubtitle}>
            Dosyanız güvenli bir şekilde maskelendi.
          </Text>
        </View>

        {/* File Preview Card */}
        <View style={styles.previewCard}>
          {/* File Header */}
          <View style={styles.fileHeader}>
            <View style={styles.fileIconWrapper}>
              <Ionicons name="document-text" size={32} color="#f4259d" />
              <Text style={styles.emoji}>😎</Text>
            </View>
            <Text style={styles.previewFileName} numberOfLines={1}>
              {maskedFileName}
            </Text>
          </View>

          {/* Preview Content */}
          <View style={styles.previewContent}>
            <Text style={styles.previewText}>
              {getPreviewText().split('\n').map((line, index) => {
                // Highlight masked parts
                const parts = line.split('●');
                return (
                  <Text key={index}>
                    {parts.map((part, i) => (
                      <Text key={i}>
                        {part}
                        {i < parts.length - 1 && (
                          <Text style={styles.maskedChar}>●</Text>
                        )}
                      </Text>
                    ))}
                    {index < getPreviewText().split('\n').length - 1 && '\n'}
                  </Text>
                );
              })}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f78ca0', '#fd868c', '#fe9a8b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadButtonGradient}
            >
              <Text style={styles.downloadButtonText}>Dosyayı İndir</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newFileButton}
            onPress={handleNewFile}
            activeOpacity={0.8}
          >
            <Text style={styles.newFileButtonText}>Yeni Dosya Yükle</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <Text style={styles.securityText}>
            Orijinal dosyanız işlem sonrası silindi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  glowEffect: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    opacity: 0.2,
    top: -20,
    left: -20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#131118',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6f6189',
    textAlign: 'center',
  },
  previewCard: {
    width: width - 32,
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileIconWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  emoji: {
    position: 'absolute',
    top: -8,
    right: -12,
    fontSize: 20,
  },
  previewFileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#131118',
  },
  previewContent: {
    padding: 16,
    maxHeight: 200,
  },
  previewText: {
    fontSize: 14,
    color: '#6f6189',
    lineHeight: 22,
  },
  maskedChar: {
    color: '#ff69b4',
    fontWeight: 'bold',
  },
  actionButtons: {
    width: width - 32,
    maxWidth: 500,
    marginBottom: 24,
  },
  downloadButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#f78ca0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  downloadButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newFileButton: {
    height: 48,
    backgroundColor: '#f2f0f4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newFileButtonText: {
    color: '#131118',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6f6189',
    textAlign: 'center',
    flex: 1,
  },
});
