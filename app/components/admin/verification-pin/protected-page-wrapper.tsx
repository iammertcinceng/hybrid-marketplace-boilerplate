"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminPinModal } from "./modals/admin-pin-modal";


interface ProtectedPageWrapperProps {
  children: React.ReactNode;
}

// PIN doğrulamasının geçerli olacağı süre (milisaniye cinsinden - 30 dakika)
const PIN_VALIDITY_DURATION = 1 * 60 * 1000;
const PIN_SESSION_KEY = 'admin_pin_verified';

export default function ProtectedPageWrapper({ children }: ProtectedPageWrapperProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sayfa yüklendiğinde önceki PIN doğrulamasını kontrol et
  useEffect(() => {
    const checkPreviousVerification = () => {
      try {
        const storedData = sessionStorage.getItem(PIN_SESSION_KEY);
        if (storedData) {
          const { timestamp } = JSON.parse(storedData);
          const now = Date.now();
          
          // Eğer 30 dakika geçmemişse, PIN doğrulamasını geçerli say
          if (now - timestamp < PIN_VALIDITY_DURATION) {
            setIsVerified(true);
          } else {
            // Süresi dolmuşsa sessionStorage'dan temizle
            sessionStorage.removeItem(PIN_SESSION_KEY);
          }
        }
      } catch (error) {
        console.error('PIN verification check error:', error);
        sessionStorage.removeItem(PIN_SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkPreviousVerification();
  }, []);

  const handleSuccess = () => {
    // PIN doğrulandığında sessionStorage'a kaydet
    const verificationData = {
      timestamp: Date.now(),
      verified: true
    };
    sessionStorage.setItem(PIN_SESSION_KEY, JSON.stringify(verificationData));
    setIsVerified(true);
  };

  const handleClose = () => {
    // Kullanıcı modalı kapatırsa, onu korumalı sayfadan uzaklaştır.
    // Bir önceki sayfaya yönlendirmek iyi bir seçenek.
    router.back();
  };

  // Yükleme durumunda loading göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <AdminPinModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );
  }

  return <>{children}</>;
}
