import FavoritesView from '@/views/root/favorites'

export async function generateMetadata() {
  return {
    title: "Favorites",
    description: "Favorilerim sayfası",
  };
}

export default function FavoritesPage() {
  return (
    <FavoritesView />
  )
}
