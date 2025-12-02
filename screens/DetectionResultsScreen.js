import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { detectData } from '../utils/dataDetection';
import { parseFile } from '../utils/fileParser';

const { width } = Dimensions.get('window');

export default function DetectionResultsScreen({ route, navigation }) {
  const { file, maskingOptions } = route.params;

  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState('');
  const [detectedData, setDetectedData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadAndDetect();
  }, []);

  const loadAndDetect = async () => {
    try {
      let content = '';

      // Check file type
      const fileType = file.mimeType || '';

      if (fileType.startsWith('image/')) {
        // For images, we need OCR (will be implemented later)
        // For now, show a message
        Alert.alert(
          'Desteklenmeyen Dosya Türü',
          'Görsel dosyaları henüz desteklenmiyor. Lütfen metin tabanlı bir dosya seçin (PDF, Word, Excel, Text).',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
        return;
      } else {
        // Use the new file parser
        try {
          content = await parseFile(file);
        } catch (readError) {
          console.error('File read error:', readError);
          Alert.alert(
            'Dosya Okuma Hatası',
            'Dosya okunamadı: ' + readError.message,
            [{ text: 'Tamam', onPress: () => navigation.goBack() }]
          );
          return;
        }
      }

      if (!content || content.trim().length === 0) {
        Alert.alert(
          'Boş Dosya',
          'Dosya boş görünüyor veya içerik okunamadı.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setFileContent(content);

      // Debug: Log file info
      console.log('=== FILE DEBUG INFO ===');
      console.log('File URI:', file.uri);
      console.log('File Name:', file.name);
      console.log('File Type:', fileType);
      console.log('Content Length:', content.length);
      console.log('Content Preview:', content.substring(0, 200));
      console.log('Masking Options:', maskingOptions);

      // Detect data
      const detected = detectData(content, maskingOptions);
      console.log('Detected Data Count:', detected.length);
      console.log('Detected Data:', detected);
      setDetectedData(detected);

      // Initially select all items
      const allIndices = new Set(detected.map((_, index) => index));
      setSelectedItems(allIndices);

      setLoading(false);
    } catch (error) {
      console.error('Error loading file:', error);
      Alert.alert(
        'Hata',
        'Dosya işlenirken bir hata oluştu: ' + error.message,
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
      setLoading(false);
    }
  };

  const toggleItem = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleApplyMasking = () => {
    navigation.navigate('Success', {
      file,
      fileContent,
      detectedData,
      selectedItems: Array.from(selectedItems),
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8c25f4" />
        <Text style={styles.loadingText}>Belge taranıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tespit Sonuçları</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Animated Header */}
      <View style={styles.resultHeader}>
        <View style={styles.magnifyingGlass}>
          <Ionicons name="search" size={60} color="#4A9B8E" />
        </View>
        <View style={styles.foundBadge}>
          <Text style={styles.emojiIcon}>🎉</Text>
          <Text style={styles.foundText}>{detectedData.length} veri bulundu!</Text>
        </View>

        {/* Debug Toggle Button */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => setShowDebug(!showDebug)}
          activeOpacity={0.8}
        >
          <Ionicons name="bug" size={20} color="#fff" />
          <Text style={styles.debugButtonText}>
            {showDebug ? 'Debug Gizle' : 'Debug Göster'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detected Items List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Debug Info Panel */}
        {showDebug && (
          <View style={styles.debugPanel}>
            <Text style={styles.debugTitle}>📊 Debug Bilgileri</Text>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Dosya Adı:</Text>
              <Text style={styles.debugValue}>{file.name}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Dosya Türü:</Text>
              <Text style={styles.debugValue}>{file.mimeType || 'Bilinmiyor'}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Dosya Boyutu:</Text>
              <Text style={styles.debugValue}>{file.size} bytes</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>İçerik Uzunluğu:</Text>
              <Text style={styles.debugValue}>{fileContent.length} karakter</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Aktif Maskeleme Seçenekleri:</Text>
              <Text style={styles.debugValue}>
                {Object.entries(maskingOptions)
                  .filter(([_, enabled]) => enabled)
                  .map(([key]) => key)
                  .join(', ')}
              </Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>İçerik Önizleme (ilk 300 karakter):</Text>
              <ScrollView style={styles.contentPreview} nestedScrollEnabled={true}>
                <Text style={styles.debugValue}>
                  {fileContent.substring(0, 300)}...
                </Text>
              </ScrollView>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Tespit Edilen Veri Sayısı:</Text>
              <Text style={styles.debugValue}>{detectedData.length}</Text>
            </View>
          </View>
        )}

        {detectedData.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemOriginal} numberOfLines={1}>
                Orijinal: {item.original}
              </Text>
              <Text style={styles.itemMasked} numberOfLines={1}>
                Maskelenmiş: {item.masked}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleItem(index)}
            >
              <Ionicons
                name={selectedItems.has(index) ? "checkbox" : "square-outline"}
                size={28}
                color={selectedItems.has(index) ? "#8c25f4" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        ))}

        {detectedData.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Hiç veri tespit edilemedi</Text>
            <Text style={styles.emptySubtext}>
              Belgenizde maskelenebilir bir veri bulunamadı.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      {detectedData.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyMasking}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Maskelemeyi Uygula</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonFooter}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191022',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(25, 16, 34, 0.8)',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  magnifyingGlass: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A9B8E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  foundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(140, 37, 244, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emojiIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  foundText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(140, 37, 244, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  debugSection: {
    marginBottom: 12,
  },
  debugLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    fontWeight: '600',
  },
  debugValue: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  contentPreview: {
    maxHeight: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemOriginal: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  itemMasked: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkbox: {
    marginLeft: 8,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
    backgroundColor: 'rgba(25, 16, 34, 0.95)',
  },
  applyButton: {
    height: 56,
    backgroundColor: '#8c25f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButtonFooter: {
    height: 56,
    backgroundColor: 'rgba(140, 37, 244, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
