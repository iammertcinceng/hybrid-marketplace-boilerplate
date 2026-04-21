"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@app/hooks/use-toast";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DataTable } from "@app/components/ui/data-table";
import { FaToggleOff, FaTrash, FaFlag, FaPowerOff, FaTimes, FaTimesCircle } from "react-icons/fa";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import type { Row } from "@tanstack/react-table";
import Link from "next/link";
import { Loader2, PowerOff } from "lucide-react";
interface Listing {
  id: number;
  title: string;
  createdAt: string;
  endDate: string | null;
  viewCount: number;
  city: string;
  listingType: string;
  categoryName: string;
  active: boolean;
  approved: boolean;
}

export default function ActiveListings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/listings/${id}/reject`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("İlan reddedilemedi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-listings"] });
      toast({
        title: "Success",
        description: "Listing rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/listings/${id}/deactivate`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("İlan pasife alınamadı");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-listings"] });
      toast({
        title: "Success",
        description: "Listing deactivated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/listings/${id}/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("İlan silinemedi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-listings"] });
      toast({
        title: "Success",
        description: "Listing and all related data deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const {
    data: listings,
    isLoading,
    error,
  } = useQuery<Listing[]>({
    queryKey: ["active-listings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/listings/active", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("İlanlar yüklenemedi");
      return res.json();
    },
  });

  // Get unique categories and cities from listings
  const categories = Array.from(
    new Set(listings?.map((listing: Listing) => listing.categoryName) || [])
  );
  const cities = Array.from(
    new Set(listings?.map((listing: Listing) => listing.city) || [])
  );

  const filteredListings = listings?.filter((listing: Listing) => {
    if (
      selectedCategory &&
      selectedCategory !== "all" &&
      listing.categoryName !== selectedCategory
    )
      return false;
    if (selectedCity && selectedCity !== "all" && listing.city !== selectedCity)
      return false;
    return true;
  });

  const handleReject = async (id: number) => {
    if (window.confirm("Bu ilanı reddetmek istediğinize emin misiniz?")) {
      await rejectMutation.mutateAsync(id);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (window.confirm("Bu ilanı pasife almak istediğinize emin misiniz?")) {
      await deactivateMutation.mutateAsync(id);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Bu ilanı ve ilgili tüm verileri kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const columns = [
    {
      header: "Başlık",
      accessorKey: "title",
      cell: ({ row }: { row: Row<Listing> }) => (
        <Link
          href={`/management/listing/${row.original.id}`}
          className="cursor-pointer text-left hover:text-blue-600 hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      header: "Kategori",
      accessorKey: "categoryName",
    },
    {
      header: "Eklenme Tarihi",
      accessorKey: "createdAt",
      cell: ({ row }: { row: Row<Listing> }) =>
        format(new Date(row.original.createdAt), "dd.MM.yy", { locale: tr }),
    },
    {
      header: "Bitiş",
      accessorKey: "endDate",
      cell: ({ row }: { row: Row<Listing> }) =>
        row.original.endDate
          ? format(new Date(row.original.endDate), "dd.MM.yy", { locale: tr })
          : "-",
    },
    {
      header: "Görülme",
      accessorKey: "viewCount",
      cell: ({ row }: { row: Row<Listing> }) => row.original.viewCount || 0,
    },
    {
      header: "Şehir",
      accessorKey: "city",
      cell: ({ row }: { row: Row<Listing> }) => row.original.city,
    },
    {
      header: "Tipi",
      accessorKey: "listingType",
      cell: ({ row }: { row: Row<Listing> }) => (
        <span
          className={cn(
            row.original.listingType === "premium" && "text-blue-500 font-bold"
          )}
        >
          {row.original.listingType === "premium" ? "Premium" : "Standart"}
        </span>
      ),
    },
    {
      header: "İşlemler",
      cell: ({ row }: { row: Row<Listing> }) => (
        <div className="flex flex-col sm:flex-row gap-2 min-w-[120px] sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            className="text-gray-500 w-full sm:w-auto"
            onClick={() => handleDeactivate(row.original.id)}
            disabled={deactivateMutation.isPending}
            title="Pasif İlan"
          >
            <PowerOff className="h-4 w-4 sm:mr-1" />
            <span className="sm:hidden">Pasif</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 w-full sm:w-auto"
            onClick={() => handleReject(row.original.id)}
            disabled={rejectMutation.isPending}
            title="Reddet"
          >
            <FaTimesCircle className="h-4 w-4 sm:mr-1" />
            <span className="sm:hidden">Reddet</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-500 w-full sm:w-auto"
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteMutation.isPending}
            title="Sil"
          >
            <FaTrash className="h-4 w-4 sm:mr-1" />
            <span className="sm:hidden">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  if (error) return <div>Hata oluştu: {(error as Error).message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Active Listings</h1>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredListings || []} />
    </div>
  );
}
