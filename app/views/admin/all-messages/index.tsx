"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@app/components/ui/pagination";
import Link from "next/link";

// Type definitions
interface ConversationWithDetails {
  id: number;
  listingId: number;
  listingTitle: string;
  sender: { id: number; username: string; isAdmin?: boolean };
  receiver: { id: number; username: string };
  messageCount: number;
  createdAt: string;
  is_admin_conversation: boolean;
}

interface PaginatedResponse {
  data: ConversationWithDetails[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function AllMessages() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // Fetch all conversations
  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["/api/admin/conversations", page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/conversations?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
  });

  const conversations = data?.data || [];
  const pagination = data?.pagination;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tüm Mesajlar</h1>
      </header>

      {/* Desktop Table View */}
      <section className="hidden lg:block rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">İlan Başlığı</TableHead>
              <TableHead className="font-semibold">Gönderici</TableHead>
              <TableHead className="font-semibold">Alıcı</TableHead>
              <TableHead className="text-center font-semibold">
                Mesaj Sayısı
              </TableHead>
              <TableHead className="text-center font-semibold">Tarih</TableHead>
              <TableHead className="text-right font-semibold">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <TableRow
                  key={conversation.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {conversation.listingTitle}
                  </TableCell>
                  <TableCell>{conversation.is_admin_conversation && conversation.sender?.isAdmin ? "YÖNETİM" : conversation.sender.username}</TableCell>
                  <TableCell>{conversation.receiver.username}</TableCell>
                  <TableCell className="text-center">
                    {conversation.messageCount}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {new Date(conversation.createdAt).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/management/listing-message-detail/${conversation.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Detaylar</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Henüz hiçbir mesaj bulunmuyor.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {/* Mobile Card View */}
      <section className="lg:hidden space-y-4">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div key={conversation.id} className="border rounded-lg p-4 space-y-3 bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-muted-foreground">#{conversation.id}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(conversation.createdAt).toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground min-w-fit">İlan:</span>
                  <span className="text-sm font-medium text-right break-words">{conversation.listingTitle}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Gönderici:</span>
                  <span className="text-sm">{conversation.is_admin_conversation && conversation.sender?.isAdmin ? "YÖNETİM" : conversation.sender.username}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Alıcı:</span>
                  <span className="text-sm">{conversation.receiver.username}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Mesaj Sayısı:</span>
                  <span className="text-sm font-medium">{conversation.messageCount}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Link
                  href={`/management/listing-message-detail/${conversation.id}`}
                  className="inline-flex items-center justify-center gap-1 text-primary hover:text-primary-dark transition-colors w-full py-1.5 px-2 rounded hover:bg-muted text-sm"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Detaylar</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border rounded-lg bg-card">
            <p className="text-muted-foreground">
              Henüz hiçbir mesaj bulunmuyor.
            </p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <footer className="flex justify-center">
          <Pagination>
            <PaginationContent className="flex gap-1">
              <PaginationItem>
                <PaginationLink
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`${
                    page === 1 ? "pointer-events-none opacity-50" : ""
                  } p-2`}
                >
                  <PaginationPrevious className="h-5 w-5" />
                </PaginationLink>
              </PaginationItem>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - page) <= 1
                )
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setPage(p)}
                        isActive={page === p}
                        className="px-3 py-1"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

              <PaginationItem>
                <PaginationLink
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  className={`${
                    page === pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  } p-2`}
                >
                  <PaginationNext className="h-5 w-5" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </footer>
      )}
    </div>
  );
}