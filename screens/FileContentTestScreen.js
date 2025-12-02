import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parseFile } from '../utils/fileParser';

export default function FileContentTestScreen({ route, navigation }) {
  const { file } = route.params;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFileContent();
  }, []);

  const loadFileContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileContent = await parseFile(file);
      setContent(fileContent);
    } catch (err) {
      console.error('Error loading file:', err);
      setError(err.message || 'Dosya okunamadı');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Dosya İçeriği</Text>
        <View style={styles.placeholder} />
      </View>

      {/* File Info */}
      <View style={styles.fileInfo}>
        <View style={styles.fileInfoRow}>
          <Ionicons name="document-text" size={20} color="#f4258c" />
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
        <Text style={styles.fileType}>
          {file.mimeType?.split('/')[1]?.toUpperCase() || 'Document'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#f4258c" />
            <Text style={styles.loadingText}>Dosya okunuyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadFileContent}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.contentHeader}>
              <Ionicons name="reader" size={20} color="#181114" />
              <Text style={styles.contentHeaderText}>
                İçerik ({content.length} karakter)
              </Text>
            </View>
            <View style={styles.contentBox}>
              <Text style={styles.contentText} selectable>
                {content}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0e3',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181114',
  },
  placeholder: {
    width: 40,
  },
  fileInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0e3',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181114',
    marginLeft: 8,
    flex: 1,
  },
  fileType: {
    fontSize: 12,
    color: '#694b5f',
    marginLeft: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#694b5f',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f4258c',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181114',
    marginLeft: 8,
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e0e3',
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#181114',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
