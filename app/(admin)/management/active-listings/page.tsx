import ActiveListingsView from '@/views/admin/active-listings'

export async function generateMetadata() {
  return {
    title: "Active Listings",
    description: "Aktif ilanlar sayfası",
  };
}

export default function page() {
  return (
    <ActiveListingsView />
  )
}
