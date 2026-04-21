import CreateListingView from "@/views/root/add-listing";
import { headers } from "next/headers";
export async function generateMetadata() {
  return {
    title: "İlan Ekle",
    description: "İlan ekleme sayfası",
  };
}

const fetchUserStatus = async () => {
  const headersList = headers();
  const cookies = headersList.get("cookie");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/status`,
    {
      headers: {
        Cookie: cookies || "",
      },
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
};

export default async function CreateListingPage() {
  const userStatus = await fetchUserStatus();

  return (
    <CreateListingView hasUsedFreeAd={Boolean(userStatus?.user?.has_used_free_ad)} />
  );
}
