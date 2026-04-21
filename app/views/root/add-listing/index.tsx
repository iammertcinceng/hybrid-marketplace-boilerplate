"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { useToast } from "@app/hooks/use-toast";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { EmojiInput } from "@app/components/EmojiInput";
import { RichTextEditor } from "@app/components/Editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@app/components/ui/form";
import { queryClient } from "@/lib/queryClient";
import { useRouter } from "next/navigation";
import { TermsModal } from "@app/components/TermsModal";
import { Checkbox } from "@app/components/ui/checkbox";
import { turkishCities } from "@/lib/constants";

interface CreateListingProps {
  isAdmin?: boolean;
  hasUsedFreeAd?: boolean;
}

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

// Category tipini genişleterek listingCount özelliğini opsiyonel olarak ekleyelim
interface CategoryWithCount extends Category {
  listingCount: number;
}

export default function CreateListing({ isAdmin = false, hasUsedFreeAd = false }: CreateListingProps) {
  const { toast } = useToast();
  const forcedListingType = useMemo(
    () => (hasUsedFreeAd ? "premium" : "standard"),
    [hasUsedFreeAd]
  );
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      city: "",
      categoryId: "",
      contactPerson: "",
      phone: "",
      listingType: forcedListingType,
      images: undefined as FileList | undefined,
      contractAccepted: false,
    },
  });

  // Ensure listingType stays in sync and cannot be changed via UI
  useEffect(() => {
    form.setValue("listingType", forcedListingType, { shouldValidate: false });
  }, [forcedListingType]);

  const router = useRouter();

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories/all").then((res) => res.json()),
  });

  const onSubmit = async (values: any) => {
    try {
      if (
        !values.categoryId ||
        !values.title ||
        !values.description ||
        !values.city ||
        !values.contractAccepted
      ) {
        throw new Error("Zorunlu alanları doldurunuz");
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("city", values.city);
      formData.append("categoryId", values.categoryId);
      formData.append("listingType", values.listingType || "standard");
      formData.append("contactPerson", values.contactPerson || "");
      formData.append("phone", values.phone || "");

      if (values.images) {
        Array.from(values.images as FileList).forEach((file: File) => {
          formData.append("images", file);
        });
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Invalidate pending listings query after successful submission
      queryClient.invalidateQueries({ queryKey: ["pending-listings"] });


      //ÜCRETİ İLAN SONRASINDA ÖDEME YAPILACAK - PREMİUM İLAN YÖNLENDİRME
      if (values.listingType === "premium") {
        // Oluşturulan ilanın ID'sini ödeme sayfasına parametre olarak ekle
        // router.push(`/payment?listing_id=${data.id}`);
      } else {
        toast({
          title: "Success",
          description: "İlanınız onay için gönderildi",
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error.message || "İlan oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">İlan Oluştur</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/30 backdrop-blur-md border border-white/20 shadow-lg rounded-xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Yeni İlan Oluştur</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "İlan başlığı zorunludur" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlan Başlığı</FormLabel>
                      <FormControl>
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
                      <Select onValueChange={field.onChange}>
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
                      <Select onValueChange={field.onChange}>
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
                                disabled={true}
                                className="font-bold bg-gray-100"
                              >
                                {category.name}
                              </SelectItem>
                              {/* Subcategories - selectable */}
                              {category.children.map((subCategory) => (
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
                        <Input
                          {...field}
                          placeholder="İlgili kişi adını yazın"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon Numarası (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Telefon numarasını yazın"
                          pattern="[0-9]*"
                          onKeyPress={(e) => {
                            const charCode = e.charCode;
                            if (charCode < 48 || charCode > 57) {
                              e.preventDefault();
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
                        Maksimum 5 adet resim yükleyebilirsiniz (her biri max.
                        1MB)
                      </p>
                    </FormItem>
                  )}
                />

                {/* Bilgilendirme ve zorunlu listeleme türü göstergesi */}
                <div
                  className={
                    forcedListingType === "standard"
                      ? "p-4 rounded-md bg-green-50 border border-green-200 text-green-800"
                      : "p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800"
                  }
                >
                  <p className="font-semibold">
                    {forcedListingType === "standard"
                      ? "İLK ilanda ücretsiz hakkınızı kullanıyorsunuz."
                      : ""}
                  </p>
                  <p className="text-sm mt-1 opacity-80">
                    Mevcut hakkınıza göre otomatik olarak
                    {" "}
                    <span className="font-medium">
                      {forcedListingType === "standard"
                        ? "Standart Listeleme (Ücretsiz)"
                        : "Öncelikli Listeleme (Ücretli)"}
                    </span>
                    {" "}
                    uygulanacaktır.
                  </p>
                </div>
                {/* Hidden input to keep RHF value bound */}
                <input type="hidden" value={forcedListingType} {...form.register("listingType")} />

                <FormField
                  control={form.control}
                  name="contractAccepted"
                  rules={{ required: "Sözleşmeyi kabul etmelisiniz" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          <TermsModal>
                            <span className="text-primary hover:underline">
                              Sözleşmeyi okudum ve kabul ediyorum
                            </span>
                          </TermsModal>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit">İlan Oluştur</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
