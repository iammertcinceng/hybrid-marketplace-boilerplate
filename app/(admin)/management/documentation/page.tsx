import { redirect } from 'next/navigation';

export async function generateMetadata() {
  return {
    title: 'Sistem Dokümantasyonu',
    description: 'Sistem teknolojileri ve API anahtarları dokümantasyonu',
  };
}

export default function DocumentationPage() {
  // Ana dokümantasyon sayfasına gelince teknoloji stack'e yönlendir
  redirect('/management/documentation/teknoloji-stack');
}
