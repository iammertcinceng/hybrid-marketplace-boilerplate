import InactiveListings from '@/views/admin/inactive-listings'

export async function generateMetadata() {
  return {
    title: "Inactive Listings",
    description: "Pasif ilanlar sayfası",
  };
}

export default function InactiveListingsPage() {
  return (
    <InactiveListings />
  )
}
