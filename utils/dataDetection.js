// Turkish ID validation algorithm
export const isValidTC = (tc) => {
  if (tc.length !== 11) return false;
  const digits = tc.split('').map(Number);
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const check10 = (sum1 - sum2) % 10;
  return check10 === digits[9];
};

// Regex patterns for different data types
const patterns = {
  tcKimlik: {
    name: 'T.C. Kimlik No',
    icon: 'card',
    color: '#FF6B6B',
    regex: /\b[1-9]\d{10}\b/g,
    mask: (match) => match.substring(0, 3) + '●●●●●●●' + match.substring(10),
    validate: (match) => isValidTC(match)
  },
  email: {
    name: 'Email Adresi',
    icon: 'mail',
    color: '#4ECDC4',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    mask: (match) => {
      const [local, domain] = match.split('@');
      return local.substring(0, 2) + '●●●@' + domain;
    }
  },
  telefon: {
    name: 'Telefon Numarası',
    icon: 'call',
    color: '#95E1D3',
    regex: /(\+90|0)?[\s-]?\(?([0-9]{3})\)?[\s-]?([0-9]{3})[\s-]?([0-9]{2})[\s-]?([0-9]{2})\b/g,
    mask: (match) => {
      const cleaned = match.replace(/[\s-()]/g, '');
      if (cleaned.startsWith('+90')) {
        return '+90 ●●● ●●● ●● ●●';
      } else if (cleaned.startsWith('0')) {
        return '0●●● ●●● ●● ●●';
      }
      return '●●● ●●● ●● ●●';
    }
  },
  krediKarti: {
    name: 'Kredi Kartı',
    icon: 'card',
    color: '#F38181',
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    mask: (match) => {
      const cleaned = match.replace(/[\s-]/g, '');
      return '●●●● ●●●● ●●●● ' + cleaned.substring(12);
    }
  },
  iban: {
    name: 'IBAN',
    icon: 'card-outline',
    color: '#AA96DA',
    regex: /\b[A-Z]{2}\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2}\b/g,
    mask: (match) => {
      const cleaned = match.replace(/[\s-]/g, '');
      return cleaned.substring(0, 4) + ' ●●●● ●●●● ●●●● ●●●● ●●●● ●●';
    }
  },
  dogumTarihi: {
    name: 'Doğum Tarihi',
    icon: 'calendar',
    color: '#FCBAD3',
    regex: /\b(0?[1-9]|[12][0-9]|3[01])[\.\/\-](0?[1-9]|1[0-2])[\.\/\-](19|20)\d{2}\b/g,
    mask: () => '●●.●●.●●●●'
  },
  adres: {
    name: 'Adres',
    icon: 'home',
    color: '#3F51B5',
    regex: /(Cadde|Cad\.|Sokak|Sok\.|Mahalle|Mah\.|Bulvar|Blv\.)[\s\w:\/\d]+(Kat|Daire|No)?:?\s?\d+/gi,
    mask: () => '[ADRES GİZLENDİ]'
  },
  pasaport: {
    name: 'Pasaport No',
    icon: 'airplane',
    color: '#A8D8EA',
    regex: /\b[A-Z]\d{8}\b/g,
    mask: (match) => match.substring(0, 1) + '●●●●●●●●'
  },
  vergiNo: {
    name: 'Vergi No',
    icon: 'receipt',
    color: '#FFABAB',
    regex: /\bVergi\s?(No|Numarası)?:?\s?(\d{10})\b/gi,
    mask: (match) => match.replace(/\d/g, '●')
  },
  adSoyad: {
    name: 'Ad Soyad',
    icon: 'person',
    color: '#9C27B0',
    regex: /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/g,
    mask: (match) => {
      const parts = match.split(' ');
      return parts[0].substring(0, 1) + '●●● ' + parts[1].substring(0, 1) + '●●●';
    }
  }
};

// Map old option keys to new pattern keys
const optionMapping = {
  tc: 'tcKimlik',
  phone: 'telefon',
  email: 'email',
  iban: 'iban',
  name: 'adSoyad',
  address: 'adres',
  creditCard: 'krediKarti',
  birthDate: 'dogumTarihi',
  passport: 'pasaport',
  taxNumber: 'vergiNo'
};

// Detect all personal data in text
export const detectData = (text, options) => {
  const detectedData = [];
  const seenValues = new Set();

  // Process each selected option
  Object.entries(options).forEach(([optionKey, isEnabled]) => {
    if (!isEnabled) return;

    const patternKey = optionMapping[optionKey];
    if (!patternKey || !patterns[patternKey]) return;

    const pattern = patterns[patternKey];
    const matches = text.match(pattern.regex) || [];

    matches.forEach(match => {
      // Skip duplicates
      if (seenValues.has(match)) return;

      // Validate if validation function exists
      if (pattern.validate && !pattern.validate(match)) return;

      seenValues.add(match);

      detectedData.push({
        type: patternKey,
        label: pattern.name,
        icon: pattern.icon,
        color: pattern.color,
        original: match,
        masked: pattern.mask(match)
      });
    });
  });

  return detectedData;
};

// Mask the content based on selected items
export const maskContent = (text, detectedData, selectedIndices) => {
  let maskedText = text;

  selectedIndices.forEach(index => {
    const item = detectedData[index];
    if (item) {
      const escapedOriginal = item.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      maskedText = maskedText.replace(new RegExp(escapedOriginal, 'g'), item.masked);
    }
  });

  return maskedText;
};
