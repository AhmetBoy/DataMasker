import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import PizZip from 'pizzip';
// PDF-lib has compatibility issues with React Native
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Helper function to escape XML special characters
const escapeXML = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Parse text file
export const parseTextFile = async (uri) => {
  try {
    const content = await FileSystem.readAsStringAsync(uri);
    return content;
  } catch (error) {
    console.error('Error reading text file:', error);
    throw error;
  }
};

// Parse XLSX file
export const parseXLSXFile = async (uri) => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Parse Excel file
    const workbook = XLSX.read(bytes, { type: 'array' });

    // Extract text from all sheets
    let allText = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_csv(sheet);
      allText += `\n=== ${sheetName} ===\n${sheetData}\n`;
    });

    return allText;
  } catch (error) {
    console.error('Error reading XLSX file:', error);
    throw error;
  }
};

// PDF support
export const parsePDFFile = async (uri) => {
  // PDF text extraction is complex in React Native environment
  // Recommending alternative approaches
  throw new Error('PDF okuma şu anda desteklenmiyor. Lütfen PDF\'yi Word (.docx) veya Excel formatına dönüştürerek kullanın. Online araçlar: https://www.ilovepdf.com/pdf_to_word');
};

// DOCX support
export const parseDOCXFile = async (uri) => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryString = atob(base64);

    // Load the docx file with PizZip
    const zip = new PizZip(binaryString);

    // Get the document.xml file which contains the text
    const documentXML = zip.file('word/document.xml');

    if (!documentXML) {
      throw new Error('document.xml not found in the docx file');
    }

    const xmlContent = documentXML.asText();

    // Extract text from XML (simple extraction)
    // This regex finds all text between <w:t> tags
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);

    if (!textMatches) {
      return '';
    }

    // Extract and join all text
    const extractedText = textMatches
      .map(match => {
        const text = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        return text;
      })
      .join(' ');

    // Clean up excessive spaces
    return extractedText.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error reading DOCX file:', error);
    throw new Error('Word dosyası okunamadı: ' + error.message);
  }
};

// Write DOCX file with masked content
export const writeDOCXFile = async (originalUri, maskedText, outputFileName) => {
  try {
    // Read original file as base64
    const base64 = await FileSystem.readAsStringAsync(originalUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryString = atob(base64);

    // Load the docx file with PizZip
    const zip = new PizZip(binaryString);

    // Get the document.xml file
    const documentXML = zip.file('word/document.xml');
    if (!documentXML) {
      throw new Error('document.xml not found in the docx file');
    }

    let xmlContent = documentXML.asText();

    // Replace all text content with masked text
    // Simple approach: replace all <w:t> tags content with masked version
    const escapedMaskedText = escapeXML(maskedText);

    // Split masked text into words to distribute across paragraphs
    const words = escapedMaskedText.split(' ');
    let wordIndex = 0;

    xmlContent = xmlContent.replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, (match) => {
      if (wordIndex < words.length) {
        const word = words[wordIndex];
        wordIndex++;
        return match.replace(/>([^<]*)</, `>${word}<`);
      }
      return match.replace(/>([^<]*)</, `><`); // Empty tag if we run out of words
    });

    // Update the document.xml in the zip
    zip.file('word/document.xml', xmlContent);

    // Generate new docx file
    const newDocxBinary = zip.generate({ type: 'base64' });

    // Write to file system
    const outputUri = FileSystem.documentDirectory + outputFileName;
    await FileSystem.writeAsStringAsync(outputUri, newDocxBinary, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  } catch (error) {
    console.error('Error writing DOCX file:', error);
    throw new Error('Word dosyası yazılamadı: ' + error.message);
  }
};

// Write PDF file with masked content
export const writePDFFile = async (originalUri, maskedText, outputFileName) => {
  // PDF generation is complex in React Native environment
  // Recommending to export as Text and convert to PDF externally
  throw new Error('PDF yazma şu anda desteklenmiyor. Maskelenmiş veriyi Text dosyası olarak indirebilir ve daha sonra PDF\'e dönüştürebilirsiniz.');
};

// Write XLSX file with masked content
export const writeXLSXFile = async (originalUri, maskedText, outputFileName) => {
  try {
    // For Excel files, we'll create a new workbook with the masked data
    // Parse the masked text back into rows
    const rows = maskedText.split('\n').filter(line => !line.startsWith('==='));

    // Create worksheet from the rows
    const ws = XLSX.utils.aoa_to_sheet(rows.map(row => row.split(',')));

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Masked Data');

    // Write to binary
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    // Write to file system
    const outputUri = FileSystem.documentDirectory + outputFileName;
    await FileSystem.writeAsStringAsync(outputUri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  } catch (error) {
    console.error('Error writing XLSX file:', error);
    throw new Error('Excel dosyası yazılamadı: ' + error.message);
  }
};

// Main parser function
export const parseFile = async (file) => {
  const { uri, mimeType, name } = file;

  console.log('Parsing file:', { name, mimeType, uri });

  // Determine file type
  let fileType = mimeType;
  if (!fileType) {
    // Fallback: determine by extension
    const extension = name.split('.').pop().toLowerCase();
    const mimeTypes = {
      txt: 'text/plain',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    fileType = mimeTypes[extension] || 'text/plain';
  }

  console.log('Detected file type:', fileType);

  // Parse based on type
  if (fileType.includes('text') || fileType.includes('plain')) {
    return await parseTextFile(uri);
  } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return await parseXLSXFile(uri);
  } else if (fileType.includes('pdf')) {
    return await parsePDFFile(uri);
  } else if (fileType.includes('word') || fileType.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) {
    return await parseDOCXFile(uri);
  } else {
    // Try as text
    return await parseTextFile(uri);
  }
};
