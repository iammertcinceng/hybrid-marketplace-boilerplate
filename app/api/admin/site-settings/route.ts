import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from "@shared/db";
import { site_settings } from '@shared/schemas';
import { insertSiteSettingsSchema } from '@shared/schemas';
import { z } from "zod";
import { eq } from "drizzle-orm";
import { checkAdminAuth } from '@/utils/check-admin';
import { users } from '@shared/schemas';

export const dynamic = 'force-dynamic';

// Site settings getter API
export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const admin = await checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    // Get existing settings
    const [settings] = await db
      .select()
      .from(site_settings)
      .limit(1);

    // If no settings exist, create default ones
    if (!settings) {
      // Check if user exists before adding it to settings
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(admin.userId)))
        .limit(1);

      const [newSettings] = await db
        .insert(site_settings)
        .values({
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
          updated_by: userExists.length > 0 ? Number(admin.userId) : null,
        })
        .returning();

      return NextResponse.json(newSettings);
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

// Update site settings API
export async function PUT(request: NextRequest) {
  try {
    // Admin authentication check
    const admin = await checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    try {
      insertSiteSettingsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return NextResponse.json(
          { error: "Doğrulama hatası", details: errorMessages },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Geçersiz istek formatı" },
        { status: 400 }
      );
    }

    // Check if settings already exist
    const [existingSettings] = await db
      .select()
      .from(site_settings)
      .limit(1);

    // Make sure user exists before adding it to settings
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(admin.userId)))
      .limit(1);

    const settingsWithUser = {
      ...body,
      updated_at: new Date(),
      // Only set updated_by if user exists
      updated_by: userExists.length > 0 ? Number(admin.userId) : null,
    };

    // Update or insert settings
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(site_settings)
        .set(settingsWithUser)
        .where(eq(site_settings.id, existingSettings.id))
        .returning();

      return NextResponse.json(updatedSettings);
    } else {
      const [newSettings] = await db
        .insert(site_settings)
        .values(settingsWithUser)
        .returning();

      return NextResponse.json(newSettings);
    }
  } catch (error) {
    console.error("Site ayarları güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Site ayarları güncellenirken bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
} 