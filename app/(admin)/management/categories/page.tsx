import KategorilerPage from '@/views/admin/categoryler'

export async function generateMetadata() {
  return {
    title: "Kategoriler",
    description: "Kategoriler sayfası",
  };
}

export default function CategoriesPage() {
  return (
    <KategorilerPage />
  )
}
