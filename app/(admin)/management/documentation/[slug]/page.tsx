'use client'

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { 
  Settings, 
  Key, 
  Mail, 
  Cloud, 
  CreditCard, 
  Bot,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@app/components/ui/collapsible';

interface DocumentationPageProps {
  params: {
    slug: string;
  };
}

interface Section {
  title: string;
  content: string;
}

interface DocumentationItem {
  title: string;
  icon: any;
  sections: Section[];
}

const documentationData: Record<string, DocumentationItem> = {
  'teknoloji-stack': {
    title: 'Teknoloji Stack',
    icon: Settings,
    sections: [
      {
        title: 'Frontend & Backend Framework',
        content: `Bu projede **Next.js 14.2.3** ana framework olarak kullanılmaktadır. Next.js, React tabanlı full-stack web uygulamaları geliştirmek için kullanılan modern bir framework'tür.

**Projede Kullanımı:**
• Server-side rendering (SSR) ve static generation
• API routes ile backend fonksiyonalitesi
• File-based routing sistemi
• Otomatik code splitting ve optimizasyon

**Ana Teknolojiler:**
• Next.js 14.2.3 - Full-stack React framework
• React 18.3.1 - UI kütüphanesi  
• TypeScript 5.6.3 - Tip güvenliği
• Tailwind CSS 3.4.14 - Utility-first CSS framework
• Radix UI - Erişilebilir komponent kütüphanesi

**Genel Bilgi:** Next.js, Vercel tarafından geliştirilen ve React ekosisteminin en popüler framework'lerinden biridir. Production-ready uygulamalar için optimize edilmiştir.`
      },
      {
        title: 'Veritabanı & ORM',
        content: `Veritabanı olarak **PostgreSQL** (Neon Database) kullanılmaktadır. PostgreSQL, açık kaynaklı ve güçlü bir ilişkisel veritabanı yönetim sistemidir.

**Projede Kullanımı:**
• Kullanıcı bilgileri ve kimlik doğrulama
• İlan verileri ve kategori yönetimi
• Mesajlaşma sistemi
• Admin panel verileri

**Veritabanı Stack:**
• PostgreSQL - Ana veritabanı (Neon hosted)
• Drizzle ORM 0.39.1 - Type-safe ORM
• Drizzle Kit 0.30.4 - Migration araçları

**Environment Variables:**
\`DATABASE_URL\` - PostgreSQL bağlantı string'i

**Hesap Bilgisi:** Kullanılan e-posta: *EKLENECEK*

**Genel Bilgi:** Neon, serverless PostgreSQL hizmeti sunan modern bir cloud database sağlayıcısıdır. Otomatik scaling ve branching özellikleri sunar.`
      }
    ]
  },
  'giris-yontemleri': {
    title: 'Giriş Yöntemleri',
    icon: Key,
    sections: [
      {
        title: 'NextAuth.js Sistemi',
        content: `Kimlik doğrulama için **NextAuth.js 4.24.11** kullanılmaktadır. NextAuth.js, Next.js uygulamaları için tam özellikli kimlik doğrulama kütüphanesidir.

**Projede Kullanımı:**
• Kullanıcı adı/şifre girişi
• Google OAuth 2.0 entegrasyonu
• Session yönetimi ve güvenlik
• reCAPTCHA v3 bot koruması

**Environment Variables:**
\`NEXTAUTH_SECRET\` - Session encryption key
\`GOOGLE_CLIENT_ID\` - Google OAuth client ID  
\`GOOGLE_CLIENT_SECRET\` - Google OAuth client secret
\`RECAPTCHA_SECRET_KEY\` - reCAPTCHA server key

**Hesap Bilgisi:** Kullanılan eposta: *EKLENECEK*

**Google API Key Yönetimi:** Google Cloud Console > APIs & Services > Credentials bölümünden OAuth 2.0 client credentials yönetilir.

**Genel Bilgi:** NextAuth.js, güvenli kimlik doğrulama için industry standartlarını destekler ve çoklu provider entegrasyonu sunar.`
      },
      {
        title: 'Güvenlik Özellikleri',
        content: `Güvenlik için çeşitli önlemler alınmıştır.

**Güvenlik Katmanları:**
• bcryptjs ile şifre hashleme
• reCAPTCHA v3 bot koruması
• Session-based authentication
• CSRF token koruması
• Rate limiting (gerekli)

**Devre Dışı Özellikler:**
• Facebook Login (kodda mevcut ama kapalı)`
      }
    ]
  },
  'mail-servisleri': {
    title: 'E-posta Servisleri',
    icon: Mail,
    sections: [
      {
        title: 'SMTP2GO (Aktif)',
        content: `Ana e-posta servisi olarak **SMTP2GO** kullanılmaktadır. SMTP2GO, güvenilir transactional email delivery hizmeti sunan bir platformdur.

**Projede Kullanımı:**
• Kullanıcı kayıt onayı e-postaları
• Şifre sıfırlama linkleri
• Sistem bildirimleri
• İlan durumu güncellemeleri

**SMTP2GO Ayarları:**
• Host: mail.smtp2go.com
• Port: 587
• Security: STARTTLS

**Environment Variables:**
\`SMTP_HOST\` - SMTP sunucu adresi
\`SMTP_PORT\` - SMTP port numarası  
\`SMTP_USER\` - SMTP kullanıcı adı
\`SMTP_PASS\` - SMTP şifresi
\`SMTP_FROM_NAME\` - Gönderen adı
\`SMTP_FROM_EMAIL\` - Gönderen e-posta adresi

**Hesap Bilgisi:** Kullanılan e-posta: *EKLENECEK*

**Hesap Yönetimi:** SMTP2GO Dashboard > Settings > SMTP Users bölümünden credentials yönetilir.

**Genel Bilgi:** SMTP2GO, yüksek delivery rate'i ve detaylı analytics sunan profesyonel e-posta servisidir.`
      },
      {
        title: 'SendGrid (Yedek)',
        content: `Alternatif e-posta servisi olarak **SendGrid** hazır durumda. SendGrid, Twilio'nun e-posta delivery platformudur.

**Projede Kullanımı:**
• SMTP2GO'ya alternatif olarak hazır
• Şu anda devre dışı durumda
• Gerektiğinde hızlıca aktif edilebilir

**SendGrid Ayarları:**
• API tabanlı e-posta gönderimi
• Template desteği
• Analytics ve tracking

**Environment Variables:**
\`SENDGRID_API_KEY\` - SendGrid API anahtarı
\`SENDGRID_FROM_EMAIL\` - Doğrulanmış gönderen e-posta

**Hesap Bilgisi:** Kullanılan e-posta: *EKLENECEK*

**API Key Yönetimi:** SendGrid Dashboard > Settings > API Keys bölümünden yönetilir.

**Aktivasyon:** shared/config.ts dosyasında yorum satırları kaldırılarak aktif edilebilir.

**Genel Bilgi:** SendGrid, enterprise-level e-posta delivery ve marketing automation platformudur.`
      }
    ]
  },
  'dosya-depolama': {
    title: 'Dosya Depolama',
    icon: Cloud,
    sections: [
      {
        title: 'Cloudflare R2',
        content: `Dosya depolama için **Cloudflare R2** (AWS S3 uyumlu) kullanılmaktadır. Cloudflare R2, AWS S3 API'si ile uyumlu object storage hizmetidir.

**Projede Kullanımı:**
• İlan resimlerinin depolanması
• Mesaj dosyalarının saklanması
• Profil resimlerinin yönetimi
• Otomatik CDN entegrasyonu

**Bucket Yapısı:**
• seriilan - İlan resimleri
• seriilan-mesaj-dosyalar - Mesaj dosyaları

**URL Yapısı:**
• İlan resimleri: https://images.mertcin.com
• Mesaj dosyaları: message-images.mertcin.com

**Environment Variables:**
\`CLOUDFLARE_ACCOUNT_ID\` - Cloudflare hesap ID
\`CLOUDFLARE_ACCESS_KEY_ID\` - R2 access key
\`CLOUDFLARE_SECRET_ACCESS_KEY\` - R2 secret key

**Hesap Bilgisi:** Kullanılan e-posta: *EKLENECEK*

**Yönetim Paneli:** Cloudflare Dashboard > R2 Object Storage bölümünden bucket'lar ve ayarlar yönetilir.

**Desteklenen Formatlar:**
• Resimler: JPG, PNG, WebP, GIF, HEIC
• Dökümanlar: PDF, DOC, DOCX, XLS, XLSX
• Medya: MP3, MP4, MOV, M4A
• Arşivler: ZIP, RAR

**Genel Bilgi:** Cloudflare R2, AWS S3'e göre daha uygun fiyatlı ve egress ücreti olmayan object storage hizmetidir.`
      },
      {
        title: 'Dosya İşleme',
        content: `Dosya optimizasyonu için **Sharp 0.33.5** kütüphanesi kullanılmaktadır. Sharp, Node.js için yüksek performanslı image processing kütüphanesidir.

**Projede Kullanımı:**
• Yüklenen resimlerin otomatik optimizasyonu
• Format dönüşümleri (WebP, JPEG)
• Resim boyutlandırma ve crop işlemleri
• Kalite ayarlamaları

**Optimizasyon Özellikleri:**
• Otomatik WebP dönüşümü
• Resim boyutlandırma
• Kalite optimizasyonu (%80)
• Profil resimleri: 500x500px max
• Thumbnail oluşturma

**Boyut Limitleri:**
• Resimler: 20MB
• Diğer dosyalar: 20MB
• Profil resimleri: 5MB

**Genel Bilgi:** Sharp, libvips tabanlı hızlı image processing kütüphanesidir ve production ortamlarında yaygın olarak kullanılır.`
      }
    ]
  },
  'odeme-sistemleri': {
    title: 'Ödeme Sistemleri',
    icon: CreditCard,
    sections: [
      {
        title: 'PayTR Entegrasyonu',
        content: `Ödeme işlemleri için **PayTR** entegrasyonu hazırlanmıştır. PayTR, Türkiye'nin önde gelen online ödeme sistemlerinden biridir.

**Projede Kullanımı:**
• İlan yayınlama ücreti tahsilatı
• Premium üyelik ödemeleri
• Güvenli kart işlemleri
• 3D Secure entegrasyonu

**Mevcut Durum:**
• Simülasyon modunda çalışıyor
• Gerçek API entegrasyonu henüz tamamlanmadı
• Test ortamında callback'ler çalışıyor

**Ödeme Akışı:**
• İlan yayınlama ücreti: 10 TL
• Test modunda çalışıyor
• Callback URL'leri tanımlı

**Environment Variables:**
\`PAYTR_MERCHANT_ID\` - PayTR mağaza ID
\`PAYTR_MERCHANT_KEY\` - PayTR API anahtarı
\`PAYTR_MERCHANT_SALT\` - PayTR güvenlik anahtarı

**Hesap Bilgisi:** Kullanılan e-posta: *EKLENECEK*

**Yönetim Paneli:** PayTR Merchant Panel > İşlemler bölümünden ödeme takibi yapılır.

**Yapılması Gerekenler:**
• Gerçek PayTR API entegrasyonu
• Ödeme başarı/hata callback'leri
• Ödeme logları ve raporlama

**Genel Bilgi:** PayTR, Türk bankalarıyla entegre çalışan ve yerel ödeme yöntemlerini destekleyen güvenilir bir ödeme gateway'idir.`
      }
    ]   
  },
  'state-yonetimi': {
    title: 'State Yönetimi',
    icon: Bot,
    sections: [
      {
        title: 'Redux Toolkit',
        content: `State yönetimi için **Redux Toolkit 2.6.1** kullanılmaktadır. Redux Toolkit, Redux'un modern ve basitleştirilmiş versiyonudur.

**Projede Kullanımı:**
• Kullanıcı authentication state'i
• Mesaj bildirimlerinin yönetimi
• Global uygulama state'i
• Form state yönetimi

**Genel Bilgi:** Redux Toolkit, Redux'un resmi önerilen yaklaşımıdır ve daha az boilerplate kod gerektirir.`
      },
      {
        title: 'TanStack Query',
        content: `Server state yönetimi için **TanStack Query 5.60.5** kullanılmaktadır. Eskiden React Query olarak bilinen bu kütüphane, server verilerini cache'leme ve senkronizasyon için kullanılır.

**Projede Kullanımı:**
• API çağrılarının cache'lenmesi
• Background data fetching
• Optimistic updates
• Error ve loading state yönetimi

**Ana Özellikler:**
• Otomatik cache invalidation
• Background refetching
• Offline support
• Devtools entegrasyonu

**Genel Bilgi:** TanStack Query, modern React uygulamalarında server state yönetimi için endüstri standardıdır.`
      }
    ]
  },
  'mesaj-sistemi': {
    title: 'Mesaj Sistemi',
    icon: AlertTriangle,
    sections: [
      {
        title: 'Socket.IO',
        content: `Gerçek zamanlı iletişim için **Socket.IO 4.8.1** kullanılmaktadır. Socket.IO, WebSocket tabanlı real-time bidirectional communication sağlar.

**Projede Kullanımı:**
• Anlık mesajlaşma sistemi
• Real-time bildirimler
• Kullanıcı online durumu
• Canlı iletişim özellikleri

**Environment Variables:**
Herhangi bir özel environment variable gerekmez.

**Genel Bilgi:** Socket.IO, WebSocket'lerin üzerine kurulu güvenilir real-time iletişim kütüphanesidir ve fallback mekanizmaları sunar.`
      }
    ]
  }
};

export default function DocumentationSlugPage({ params }: DocumentationPageProps) {
  const { slug } = params;
  const doc = documentationData[slug];
  const [openSections, setOpenSections] = useState<string[]>([]);

  if (!doc) {
    notFound();
  }

  const Icon = doc.icon;

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Environment variables'ı highlight et
      if (line.includes('`') && line.includes('_')) {
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => 
              part.startsWith('`') && part.endsWith('`') ? (
                <code key={partIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                  {part.slice(1, -1)}
                </code>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => 
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={partIndex}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{doc.title}</h1>
          <p className="text-sm sm:text-base text-gray-600">Sistem dokümantasyonu ve ayarları</p>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {doc.sections.map((section, index) => {
          const isOpen = openSections.includes(section.title);
          
          return (
            <Collapsible key={index} open={isOpen} onOpenChange={() => toggleSection(section.title)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between p-3 sm:p-4 h-auto text-left"
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900">{section.title}</span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-2 p-4 sm:p-6 bg-gray-50 rounded-lg border">
                  <div className="prose prose-sm max-w-none text-gray-700 text-sm sm:text-base">
                    {formatContent(section.content)}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">         
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => window.print()}>
              Yazdır
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}