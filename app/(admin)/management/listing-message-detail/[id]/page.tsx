import AdminConversationDetail from '@/views/admin/listing-message-detail'

export async function generateMetadata() {
  return {
    title: "İlan Mesaj Detayı",
    description: "İlan mesaj detayı sayfası",
  };
}

export default function page() {
  return (
    <AdminConversationDetail />
  )
}
