import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from "@shared/db";
import { site_settings } from '@shared/schemas';

export const dynamic = 'force-dynamic';

// Public site settings getter API
export async function GET(request: NextRequest) {
  try {
    // Get existing settings
    const [settings] = await db
      .select()
      .from(site_settings)
      .limit(1);

    // If no settings exist, return default values
    if (!settings) {
      return NextResponse.json({
        site_name: "SaaS Boilerplate",
        site_logo: "",
        site_favicon: "",
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
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Site ayarları getirme hatası:", error);
    return NextResponse.json(
      { error: "Site ayarları yüklenemedi" },
      { status: 500 }
    );
  }
} 