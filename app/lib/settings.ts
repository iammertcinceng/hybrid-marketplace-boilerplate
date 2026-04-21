import { db } from "@shared/db";
import { site_settings, type SiteSettings } from "@shared/schemas";
import { cache } from "react";

// Cache the site settings to avoid multiple DB calls
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const [settings] = await db
      .select()
      .from(site_settings)
      .limit(1);

    if (!settings) {
      // Yeni bir settings objesi oluşturmak yerine DB'ye default değerlerle kaydet ve döndür
      const [defaultSettings] = await db
        .insert(site_settings)
        .values({
          site_name: "SaaS Boilerplate",
          site_logo: null,
          site_favicon: null,
          home_title: "SaaS Boilerplate - İkinci El Alışveriş ve SaaS Boilerplate",
          home_description: "İkinci el eşya, araç ve daha fazlasını bulabileceğiniz güvenilir ilan platformu.",
          contact_email: "mertcin0@outlook.com",
          contact_phone: "+1 555 123 4567",
          contact_address: "123 Fake Street, CA 90210, USA",
          footer_text: "© 2024 SaaS Boilerplate. Tüm hakları saklıdır.",
          facebook_url: "",
          twitter_url: "",
          instagram_url: "",
          linkedin_url: "",
          youtube_url: "",
          updated_by: null,
        })
        .returning();

      return defaultSettings;
    }

    return settings;
  } catch (error) {
    console.error("Site settings error:", error);
    
    // Hata durumunda type-safe bir fallback döndür
    throw new Error(`Site ayarları yüklenemedi: ${(error as Error).message}`);
  }
}); 