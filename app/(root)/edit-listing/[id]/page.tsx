import EditListingView from '@/views/root/edit-listing'

export async function generateMetadata() {
  return {
    title: "İlan Düzenle",
    description: "İlan düzenleme sayfası",
  };
}

export default function EditListingPage() {
  return <EditListingView />
}