'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Settings, 
  Key, 
  Mail, 
  Cloud, 
  CreditCard, 
  Bot, 
  ChevronLeft,
  MessageCircle
} from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';

const navigationItems = [
  {
    slug: 'teknoloji-stack',
    title: 'Teknoloji Stack',
    icon: Settings,
    description: 'Framework ve kütüphaneler'
  },
  {
    slug: 'giris-yontemleri',
    title: 'Giriş Yöntemleri',
    icon: Key,
    description: 'Auth sistemleri ve sosyal giriş'
  },
  {
    slug: 'mail-servisleri',
    title: 'E-posta Servisleri',
    icon: Mail,
    description: 'SMTP ve e-posta ayarları'
  },
  {
    slug: 'dosya-depolama',
    title: 'Dosya Depolama',
    icon: Cloud,
    description: 'Cloudflare R2 ayarları'
  },
  {
    slug: 'odeme-sistemleri',
    title: 'Ödeme Sistemleri',
    icon: CreditCard,
    description: 'Stripe entegrasyonu'
  },
  {
    slug: 'state-yonetimi',
    title: 'State Yönetimi',
    icon: Bot,
    description: 'Redux Toolkit ve TanStack Query'
  },
  {
    slug: 'mesaj-sistemi',
    title: 'Mesaj Sistemi',
    icon: MessageCircle,
    description: 'Socket.IO ve mesajlaşma sistemi'
  }
];

export default function DocumentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentSlug = pathname?.split('/').pop();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sol Navigasyon */}
        <div className="w-full lg:w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Link href="/management/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Dokümantasyon
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Sistem teknolojileri</p>
              </div>
            </div>

            {/* Navigasyon Menüsü */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSlug === item.slug;
                
                return (
                  <Link
                    key={item.slug}
                    href={`/management/documentation/${item.slug}`}
                    className={`block p-2 sm:p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm sm:text-base ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 hidden sm:block">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sağ İçerik Alanı */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            <Card>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
