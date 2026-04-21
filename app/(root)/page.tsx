import * as React from "react";
import HomePage from "@/views/root/home";
import { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  slug: string;
  order: number;
  customTitle: string | null;
  metaDescription: string | null;
  content: string | null;
  faqs: string | null;
  listingCount: number;
  children: Category[];
}

// Category tipini genişleterek listingCount özelliğini opsiyonel olarak ekleyelim
interface CategoryWithCount extends Category {
  listingCount: number;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

  return {
    title: settings.home_title,
    description: settings.home_description,
    keywords: "ikinci el, ilan, alışveriş, kategoriler, fırsatlar",
    openGraph: {
      title: settings.home_title,
      description: settings.home_description,
      url: siteUrl,
      type: "website",
      images: [`${siteUrl}/og-image.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.home_title,
      description: settings.home_description,
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function Home() {
  const [categories, listingsCountResponse, dailyListingsResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/all`,
      {
        cache: 'no-store'
      }
    ).then(res => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stats/listings-count`,
      {
        cache: 'no-store'
      }
    ).then(res => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stats/daily-listings`,
      {
        cache: 'no-store'
      }
    ).then(res => res.json())
  ]);

  const listingsCount = listingsCountResponse?.count || 112; 
  //toplam aktif/bugun verilen ilan sayısı veya belirlediğimiz sayı, bunu ansayfa index.ts de de değiştirilebiliyoruz.
  const dailyListingsCount = dailyListingsResponse?.count || 35;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const settings = await getSiteSettings();

  // Schema.org yapısı
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage", // Ana sayfa bir koleksiyon sayfası olarak tanımlanıyor
    name: settings.home_title,
    description: settings.home_description,
    url: siteUrl,
    publisher: {
      "@type": "Organization",
      name: settings.site_name,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: categories.map((category: CategoryWithCount, index: number) => ({
        "@type": "Category",
        position: index + 1,
        name: category.name,
        url: `${siteUrl}/category/${category.slug}`,
      })),
    },
  };

  return (
    <>
      <HomePage categories={categories} listingsCount={listingsCount} dailyListingsCount={dailyListingsCount} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData, null, 2), // Daha okunabilir bir çıktı için 2 boşluklu biçimlendirme
        }}
      />
    </>
  );
}