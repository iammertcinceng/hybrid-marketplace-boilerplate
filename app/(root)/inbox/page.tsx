import ReceivedMessagesView from '@/views/root/messages-list'

export async function generateMetadata() {
  return {
    title: "Inbox",
    description: "Gelen mesajlar sayfası",
  };
}
export default function ReceivedMessagesPage() {
  return (
    <ReceivedMessagesView type="received" />
  )
}
