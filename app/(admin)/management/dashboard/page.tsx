import ManagementHome from '@/views/admin/dashboard'

export async function generateMetadata() {
  return {
    title: "Admin Panel",
    description: "Yönetim paneli sayfası",
  };
}

export default function page() {
  return (
    <ManagementHome />
  )
}
