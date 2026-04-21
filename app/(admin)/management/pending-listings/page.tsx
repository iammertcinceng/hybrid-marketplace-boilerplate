import PendingListings from '@/views/admin/pending-listings'

export async function generateMetadata() {
  return {
    title: "Pending Listings",
    description: "Onay bekleyen ilanlar sayfası",
  };
}

export default function PendingListingsPage() {
  return (
    <PendingListings />
  )
}
