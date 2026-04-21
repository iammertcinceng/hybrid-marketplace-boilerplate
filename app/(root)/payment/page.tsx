import PaymentView from '@/views/root/payment'

export async function generateMetadata() {
  return {
    title: "Ödeme",
    description: "Ödeme sayfası",
  };
}

export default function PaymentPage() {
  return (
    <PaymentView />
  )
}
