'use client'

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@app/hooks/use-toast";
import { useAuth } from "@app/hooks/use-auth";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@app/components/ui/form";
import type { Listing } from "@shared/schemas";
import { turkishCities, validateAndNormalizeCity } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@app/components/Editor";
import { EmojiInput } from "@app/components/EmojiInput";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  slug: string;
  order: number;
  customTitle: string | null;
  metaDescription: string | null;
  content: string | null;
  faqs: string | null;
  listingCount: number;
  children: Category[];
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      city: "",
      categoryId: "",
      contactPerson: "",
      phone: "",
      listingType: "premium",
      images: undefined as FileList | undefined,
    },
  });

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories/all").then((res) => res.json()),
  });

  // Kullanıcı ücretsiz/ücretli hakkı kontrolü kaldırıldı; 
  // düzenlenen ilanlar sadece premium olabilir.

  // Fetch listing details
  const { data: listing, isLoading: isLoadingListing } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("İlan bulunamadı");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Redirect if listing is not editable
  useEffect(() => {
    if (listing && !isLoadingListing) {
      // Kullanıcı kontrolü
      if (!user || listing.userId !== user.id) {
        toast({
          title: "Error",
          description: "Bu ilanı düzenleme yetkiniz yok",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      // İlan düzenleme kontrolü
      const isRejected = !listing.approved && !listing.active;
      const isExpired = listing.approved && !listing.active;

      if (!isRejected && !isExpired) {
        toast({
          title: "Error",
          description: "Sadece reddedilmiş veya süresi dolmuş ilanlar düzenlenebilir",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      // Form değerlerini set et (şehir değerini normalize ederek label ile eşleştir)
      const normalizedCity = validateAndNormalizeCity(listing.city) || listing.city;
      form.reset({
        title: listing.title,
        description: listing.description,
        city: normalizedCity,
        categoryId: String(listing.categoryId),
        contactPerson: listing.contactPerson || "",
        phone: listing.phone || "",
        listingType: "premium",
      });
    }
  }, [listing, user, form, isLoadingListing]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("city", values.city);
      formData.append("categoryId", values.categoryId);
      formData.append("listingType", values.listingType);
      formData.append("contactPerson", values.contactPerson || "");
      formData.append("phone", values.phone || "");

      if (values.images) {
        Array.from(values.images as FileList).forEach((file: File) => {
          formData.append("images", file);
        });
      }

      const response = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "İlan güncellenemedi");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both user listings and pending listings queries
      queryClient.invalidateQueries({ queryKey: ["pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings", "user"] });

      toast({
        title: "Success",
        description: "İlan güncellendi ve onay için gönderildi",
      });
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: any) => {
    try {
      if (!values.categoryId || !values.title || !values.description || !values.city) {
        throw new Error("Zorunlu alanları doldurunuz");
      }

      await updateMutation.mutateAsync(values);
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message || "İlan düzenlenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (isLoadingListing) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!listing) {
    return <div className="p-8 text-center">İlan bulunamadı</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">İlanı Düzenle</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/30 backdrop-blur-md border border-white/20 shadow-lg rounded-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>İlanı Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Bilgilendirme kutusu: düzenlenen/yeniden aktifleştirilen ilanlar öncelikli olarak değerlendirilir */}
                <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                  <p className="font-semibold">Yeniden aktifleştirilen ilanlar öncelikli (premium) ilan olarak değerlendirilir.</p>
                  <p className="text-sm mt-1 opacity-80">Bu ilan, onay sürecinden sonra öncelikli olarak listelenecektir.</p>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "İlan başlığı zorunludur" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlan Başlığı</FormLabel>
                      <FormControl>
                        {/* <Input {...field} /> */}
                        <EmojiInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="İlan başlığını yazın"
                          id={field.name}
                          name={field.name}
                        />  
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "İlan detayı zorunludur" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlan Detayı</FormLabel>
                      <FormControl>
                        {/* <Textarea {...field} className="min-h-[200px]" /> */}
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="İlan detaylarını yazınız..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  rules={{ required: "Şehir seçimi zorunludur" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şehir</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {turkishCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  rules={{ required: "Kategori seçimi zorunludur" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData?.map((category) => (
                            <React.Fragment key={category.id}>
                              {/* Main category - disabled */}
                              <SelectItem
                                value={category.id.toString()}
                                className="font-bold bg-gray-100"
                              >
                                {category.name}
                              </SelectItem>
                              {/* Subcategories - selectable */}
                              {category.children?.map((subCategory) => (
                                <SelectItem
                                  key={subCategory.id}
                                  value={subCategory.id.toString()}
                                  className="pl-6"
                                >
                                  {subCategory.name}
                                </SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlgili Kişi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon Numarası</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Telefon numarasını yazın"
                          pattern="[0-9]*"
                          onKeyPress={(e) => {
                            const charCode = e.charCode; // Alınan karakterin ASCII değeri
                            // Sadece 0-9 arası rakamlara izin ver
                            if (charCode < 48 || charCode > 57) {
                              e.preventDefault(); // Rakam değilse girişi engelle
                            }
                          }}
                          inputMode="numeric" // Mobil cihazlarda sayısal klavye açılır
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Resimler (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Maksimum 5 adet resim yükleyebilirsiniz (her biri max. 1MB)
                      </p>
                    </FormItem>
                  )}
                />

                {/* listingType kullanıcıdan gizlenir; her zaman premium gönderilir */}
                <input type="hidden" value="premium" {...form.register("listingType")} />

                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  İlanı Güncelle
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}