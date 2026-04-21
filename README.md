# 🚀 ENTERPRISE MARKETPLACE & SAAS BOILERPLATE

⚠️ **Disclaimer:** Bu proje, kurumsal seviyedeki pazar yeri (marketplace) ve SaaS iş akışlarını sergilemek amacıyla geliştirilmiş, tamamen anonimleştirilmiş bir portfolyo mimarisidir. Herhangi bir ticari kuruluşun özel verisini, ticari sırlarını veya aktif sistemlerini temsil etmez. Tüm iş mantığı ve UI bileşenleri genel geçer **Enterprise** standartlarına göre baştan inşa edilmiştir.

This is a Next.js enterprise marketplace/SaaS structured project. It showcases modern web architecture, robust database integration, and clean business logic patterns for secure digital listings, messaging, and user management.

## 🚀 Key Engineering Highlights
Bu proje, karmaşık pazar yeri akışlarını (C2C & B2C) yönetmek için inşa edilmiş bir "Software Architect" portfolyo örneğidir:

- **Scalable Marketplace Engine:** İlan yönetimi, kategorilendirme, SEO dostu slug'lar ve gelişmiş filtreleme altyapısı.
- **RBAC (Role-Based Access Control):** Next.js Server Actions ve entegre Middleware ile sıkılaştırılmış uçtan uca yetkilendirme katmanı (Admin & User rolleri).
- **Relational Excellence:** PostgreSQL & Drizzle ORM kullanılarak kurgulanmış, yüksek tutarlılığa sahip veri modeli.
- **Type-Safe Development:** Zod ile güçlü şema doğrulama (validation) ve uçtan uca kusursuz TypeScript entegrasyonu.
- **Real-Time Capabilities:** Dinamik soket / server-side messaging entegrasyonuna hazır, sağlam bir haberleşme köprüsü.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14+ (App Router), TailwindCSS, Radix UI, Framer Motion, Lucide Icons
- **Backend:** Next.js API Routes, Server Actions, Zod Validation
- **Database:** PostgreSQL (Relational Data)
- **ORM:** Drizzle ORM
- **Security & Auth:** NextAuth.js / Secure JWT-based Middleware Protection
- **Storage:** S3 Compatible Object Storage Architecture (R2 / AWS)

## 📦 Getting Started

```bash
# Bağımlılıkları Yükleyin (Peer dependency çakışmalarını önlemek için)
npm install --legacy-peer-deps

# Çevre değişkenlerinizi hazırlayın (.env.local içine kendi DB ve Auth bilgilerinizi girin)
# Örnek çevre değişkenleri .env.example içinde yer almaktadır.

# Veritabanını eşitleyin
npm run db:push

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızdan http://localhost:3000 adresini açarak sistemi görüntüleyebilirsiniz.

## 📖 Case Study (Deep Dive) 
Bu projenin mimari tasarımları, Drizzle ORM ile alınan performans iyileştirmeleri ve Pazar yeri lojistiğindeki kararlarım hakkında yazdığım teknik analizler için bana ulaşabilirsiniz.

👉 [https://medium.com/@mert.cin] *(Makaleler güncellenmektedir)*

## 👨‍💻 Contact & Consultancy
**Mert Çin** - Software Consultant & Computer Engineer

LinkedIn: [https://www.linkedin.com/in/mertcin/]