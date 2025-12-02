# KVKK Data Masker - Mobil Uygulama

Kullanıcıların belgelerindeki (PDF, Word, TXT) kişisel verileri otomatik maskeleyebileceği, tamamen lokal çalışan KVKK uyumlu mobil maskeleme aracı.

## 🎨 Özellikler

- **Tamamen Lokal**: Tüm işlemler cihazınızda gerçekleşir, hiçbir veri sunucuya gönderilmez
- **Çoklu Format Desteği**: PDF, Word (.docx), Text (.txt) dosyaları
- **Akıllı Tespit**:
  - T.C. Kimlik Numarası (doğrulama algoritması ile)
  - Telefon Numaraları
  - E-posta Adresleri
  - IBAN Numaraları
  - Ad Soyad
  - Adres Bilgileri
- **Modern UI**: Renkli gradyanlar, smooth animasyonlar, kullanıcı dostu arayüz
- **Seçimli Maskeleme**: Hangi verilerin maskeleneceğini kendiniz seçin

## 📱 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- Expo CLI
- Expo Go uygulaması (iOS/Android)

### Adımlar

1. Projeyi başlatın:
```bash
cd data-masker-app
npm start
```

2. Expo Go ile test edin:
   - Telefonunuza Expo Go uygulamasını indirin
   - QR kodunu tarayın
   - Uygulama cihazınızda açılacak

## 🚀 Kullanım

1. **Dosya Yükle**: Ana ekranda dosyanızı seçin
2. **Maskeleme Seçenekleri**: Hangi veri türlerinin maskeleneceğini seçin
3. **Tara**: Belge otomatik olarak taranır ve veriler tespit edilir
4. **Maskelemeyi Uygula**: Seçili verileri maskeleyin
5. **İndir/Paylaş**: Maskelenmiş dosyayı indirin veya paylaşın

## 🛠️ Teknolojiler

- **React Native** + **Expo**
- **React Navigation** (ekran geçişleri)
- **Expo Document Picker** (dosya seçimi)
- **Expo File System** (dosya okuma/yazma)
- **Expo Sharing** (dosya paylaşma)
- **Expo Linear Gradient** (gradient efektler)

## 📂 Proje Yapısı

```
data-masker-app/
├── screens/
│   ├── WelcomeScreen.js          # Dosya yükleme ekranı
│   ├── MaskingOptionsScreen.js   # Maskeleme seçenekleri
│   ├── DetectionResultsScreen.js # Tespit sonuçları
│   └── SuccessScreen.js          # Başarı ekranı
├── utils/
│   └── dataDetection.js          # Veri tespit ve maskeleme algoritmaları
├── App.js                        # Ana uygulama ve navigation
└── app.json                      # Expo konfigürasyonu
```

## 🔒 Güvenlik

- Tüm işlemler cihazda gerçekleşir
- Hiçbir veri internet üzerinden gönderilmez
- Dosyalar işlem sonrası otomatik temizlenir
- KVKK uyumlu maskeleme algoritmaları

## 📝 Notlar

- Sadece text-based içerikleri işler (resimler/taranmış PDF'ler desteklenmez)
- T.C. Kimlik No validasyonu içerir
- Türkçe karakter desteği vardır

## 🎯 Gelecek Geliştirmeler

- [ ] OCR ile taranmış belge desteği
- [ ] Özel maskeleme pattern'leri
- [ ] Dark mode
- [ ] Daha fazla dosya formatı (Excel, vb.)
- [ ] Maskeleme geçmişi

---

**Not**: Bu uygulama eğitim ve test amaçlıdır. Kritik verilerde kullanmadan önce sonuçları kontrol ediniz.
