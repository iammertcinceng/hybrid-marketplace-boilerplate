import ManagementHome from '@/views/admin/dashboard'

export async function generateMetadata() {
  return {
    title: "Yönetim Paneli",
    description: "Yönetim paneli sayfası",
  };
}

export default function page() {
  return (
    <ManagementHome />
  )
}
