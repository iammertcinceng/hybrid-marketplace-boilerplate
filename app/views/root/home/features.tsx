"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FaBolt, FaBell, FaHeart, FaSearch, FaShieldAlt, FaCloudUploadAlt, FaCheckDouble, FaCheckCircle } from "react-icons/fa";

// Simple scroll direction detector
function useScrollDirection() {
  const lastY = useRef(0);
  const [dir, setDir] = useState<"down" | "up">("down");
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setDir(y > lastY.current ? "down" : "up");
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return dir;
}

function FeatureCard({ icon, title, desc, colorClass }: { icon: ReactNode; title: string; desc: string; colorClass?: string }) {
  return (
    <motion.div
      className="group bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.3 }}
      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${
          colorClass ?? 'bg-gradient-to-br from-blue-600 to-indigo-600'
        }`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const scrollDir = useScrollDirection();
  // Auto-advance flow for: Ilan Ver -> Odeme -> Onay
  const [flowStep, setFlowStep] = useState<1 | 2 | 3>(1);
  useEffect(() => {
    const t1 = setTimeout(() => setFlowStep(2), 1300);
    const t2 = setTimeout(() => setFlowStep(3), 2600);
    const t3 = setTimeout(() => setFlowStep(1), 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [scrollDir]);

  return (
    <section className="relative py-20 bg-gradient-to-b from-white/80 via-[#F8FAFF]/70 to-[#F3F6FF]/60 backdrop-blur-[1px] overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="w-full max-w-[1800px] mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            Güçlü Özelliklerle Donatıldı
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto mt-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.5 }}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Güvenli, hızlı ve niş odaklı bir ilan deneyimi. Kaydırın ve keşfedin!
          </motion.p>
        </div>

        {/* 1) Özellik Kartları – Üst kısım */}
        <div className="mb-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard
              icon={<FaShieldAlt size={16} />}
              title="Güvenli İlan Deneyimi"
              desc="Topluluk ilkelerine aykırı içerikler tespit edilerek güvenli bir ortam sağlanır. Şikayet ve inceleme süreçleri ile kontrol sizde."
              colorClass="bg-gradient-to-br from-emerald-600 to-teal-600"
            />
            <FeatureCard
              icon={<FaSearch size={16} />}
              title="Hızlı ve Niş Arama"
              desc="Kategoriler, konum ve fiyat aralığı gibi filtrelerle aradığınızı saniyeler içinde bulun. "
              colorClass="bg-gradient-to-br from-sky-600 to-cyan-600"
            />
            <FeatureCard
              icon={<FaBell size={16} />}
              title="Anında Haberdar Olun"
              desc="Yeni mesajlar ve eşleşen ilanlar için gecikmeden bildirim alın; fırsatları kaçırmayın."
              colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={<FaHeart size={16} />}
              title="Favoriler ve Takip"
              desc="Beğendiğiniz ilanları kaydedin, satıcıları takip ederek gelişmeleri yakından izleyin."
              colorClass="bg-gradient-to-br from-rose-500 to-pink-600"
            />
            <FeatureCard
              icon={<FaCloudUploadAlt size={16} />}
              title="Zengin Medya Desteği"
              desc="İlanlarınıza fotoğraflar ve videolar ekleyin; alıcıların karar vermesini kolaylaştırın."
              colorClass="bg-gradient-to-br from-violet-600 to-purple-600"
            />
            <FeatureCard
              icon={<FaBolt size={16} />}
              title="Akıcı Sohbet Deneyimi"
              desc="Anında iletişim kurun; yazıyor, okundu ve çevrimiçi bilgileri ile akışı hissedin."
              colorClass="bg-gradient-to-br from-indigo-600 to-blue-700"
            />
          </div>
        </div>

        {/* 2) Özellik Önizlemesi – Alt kısım (scroll yönüne duyarlı aç/kapa) */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={`preview-${scrollDir}`}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 max-w-3xl mx-auto"
              initial={scrollDir === "down" ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              viewport={{ amount: 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">  
                <div className="font-semibold text-gray-900">İlan Sahibiyle Mesajlaş</div>
                <span className="text-xs text-white bg-green-500/90 px-2 py-1 rounded-md shadow-sm">Anlık</span>
              </div>
              <div className="bg-slate-100 rounded-xl p-4 md:p-5 h-[300px] md:h-[340px] overflow-hidden relative">
                {/* Incoming bubble - Photo request */}
                <motion.div
                  className="max-w-[70%] bg-white rounded-lg px-3 py-2 text-gray-800 mb-2 text-sm shadow-sm"
                  initial={{ opacity: 0, x: -8, y: 6 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ amount: 0.5 }}
                  transition={{ delay: 0.1 }}
                >
                  Ürünün fotoğraflarını görebilir miyim?
                </motion.div>

                {/* Outgoing bubble - Photo sharing */}
                <motion.div
                  className="relative max-w-[70%] ml-auto bg-blue-500 text-white rounded-lg px-3 py-2 mb-2 text-sm"
                  initial={{ opacity: 0, x: 8, y: 6 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ amount: 0.5 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-white/20 rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>3 fotoğraf</span>
                  </div>
                </motion.div>

                {/* Incoming bubble - Voice message */}
                <motion.div
                  className="max-w-[70%] bg-white rounded-lg px-3 py-2 text-gray-800 mb-2 text-sm shadow-sm"
                  initial={{ opacity: 0, x: -8, y: 6 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ amount: 0.5 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-0.5 bg-blue-400 rounded-full flex-1 relative overflow-hidden">
                        <motion.div
                          className="absolute left-0 top-0 h-full bg-blue-600 rounded-full"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "45%" }}
                          viewport={{ amount: 0.5 }}
                          transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">0:12</span>
                    </div>
                  </div>
                </motion.div>

                {/* Outgoing bubble - Response */}
                <motion.div
                  className="relative max-w-[70%] ml-auto bg-blue-500 text-white rounded-lg px-3 py-2 mb-2 text-sm"
                  initial={{ opacity: 0, x: 8, y: 6 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ amount: 0.5 }}
                  transition={{ delay: 0.7 }}
                >
                  Teşekkürler! Yarın görüşebiliriz 👍
                </motion.div>

                {/* Typing indicator */}
                <motion.div
                  className="absolute left-4 bottom-4 bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 text-xs flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ amount: 0.5 }}
                  transition={{ delay: 0.9 }}
                >
                  Yazıyor
                  <motion.span className="flex gap-1">
                    <motion.span
                      className="w-1 h-1 bg-gray-400 rounded-full"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="w-1 h-1 bg-gray-400 rounded-full"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                    />
                    <motion.span
                      className="w-1 h-1 bg-gray-400 rounded-full"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                    />
                  </motion.span>
                </motion.div>
              </div>
              {/* Footer info – sade */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Güvenli ortamda akıcı sohbet
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Yeni Önizleme: İlan Ver ve Ödeme Akışı (otomatik ilerleyen) */}
          <motion.div
            className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-900">İlan Ver ve Kolayca Öde</div>
              <span className="text-xs text-white bg-blue-600/90 px-2 py-1 rounded-md shadow-sm">Kullanıcı Dostu</span>
            </div>

            {/* Akış adımları – üstte küçük göstergeler */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-1.5 w-8 rounded-full ${flowStep === 1 ? 'bg-blue-600' : 'bg-slate-300'}`} />
              <div className={`h-1.5 w-8 rounded-full ${flowStep === 2 ? 'bg-amber-500' : 'bg-slate-300'}`} />
              <div className={`h-1.5 w-8 rounded-full ${flowStep === 3 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
            </div>

            {/* Değişen içerik alanı – sabit yükseklikli önizleme (mesajlarla aynı) */}
            <div className="bg-slate-100 rounded-xl p-4 md:p-5 h-[300px] md:h-[340px] overflow-hidden">
              <AnimatePresence mode="wait">
                {flowStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="h-full"
                  >
                    <div className="h-full flex flex-col">
                      <div className="grid gap-3 flex-1 md:grid-cols-2">
                        {/* Başlık (full width) */}
                        <div className="md:col-span-2">
                          <div className="text-[11px] font-medium text-gray-700 mb-1">Başlık</div>
                          <div className="relative h-11 bg-white rounded-lg border border-gray-200 shadow-sm px-3 flex items-center text-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-xs">Aa</div>
                            {/* auto-fill bar */}
                            <motion.div
                              className="h-5 bg-blue-600/10 rounded-md"
                              initial={{ width: 0 }}
                              animate={{ width: '80%' }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        {/* Açıklama (full width) */}
                        <div className="md:col-span-2">
                          <div className="text-[11px] font-medium text-gray-700 mb-1">Açıklama</div>
                          <div className="relative h-16 bg-white rounded-lg border border-gray-200 shadow-sm px-3 py-2">
                            <motion.div
                              className="h-3 bg-blue-600/10 rounded mb-2"
                              initial={{ width: 0 }}
                              animate={{ width: '90%' }}
                              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                            />
                            <motion.div
                              className="h-3 bg-blue-600/10 rounded"
                              initial={{ width: 0 }}
                              animate={{ width: '60%' }}
                              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
                            />
                          </div>
                        </div>

                        {/* Kategori (left) */}
                        <div>
                          <div className="text-[11px] font-medium text-gray-700 mb-1">Kategori</div>
                          <div className="relative h-11 bg-white rounded-lg border border-gray-200 shadow-sm px-3 flex items-center justify-between text-sm">
                            <span className="text-gray-500">Kategori seçin</span>
                            <span className="text-gray-400">▾</span>
                          </div>
                        </div>

                        {/* Görsel Yükleme (right) */}
                        <div>
                          <div className="text-[11px] font-medium text-gray-700 mb-1">Görsel Yükleme</div>
                          <div className="relative h-11 bg-white rounded-lg border-2 border-dashed border-gray-200 shadow-sm px-3 py-2 flex items-center justify-center text-gray-500 text-sm">
                            <div className="flex items-center gap-2">
                              <FaCloudUploadAlt className="w-4 h-4 text-gray-400" />
                              <span>Görsel seçin</span>
                            </div>
                            {/* uploaded badge smaller */}
                            <motion.span
                              className="absolute right-2 bottom-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                            >
                              Yüklendi
                            </motion.span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="mt-3 flex justify-start">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-sm">İlan Ver</button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {flowStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="h-full"
                  >
                    <div className="h-full flex flex-col">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                          <span>İlandaddy Öncelikli İlan</span>
                          <span className="font-medium">Öne Çıkan</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
                          <span>Tutar</span>
                          <span className="font-semibold">₺499,90</span>
                        </div>
                        {/* card skeleton - larger */}
                        <div className="grid gap-3 mb-4">
                          <div className="h-10 bg-slate-50 rounded border border-gray-200" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-10 bg-slate-50 rounded border border-gray-200" />
                            <div className="h-10 bg-slate-50 rounded border border-gray-200" />
                          </div>
                          <div className="h-10 bg-slate-50 rounded border border-gray-200" />
                        </div>
                        {/* Bottom actions inside card */}
                        <div className="mt-auto flex items-center justify-between">
                          <motion.button
                            className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg shadow-sm"
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.25, delay: 0.15 }}
                          >
                            Öde
                          </motion.button>
                          <motion.span
                            className="text-emerald-600 text-sm font-medium"
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.45 }}
                          >
                            Ödeme alındı ✓
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {flowStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35 }}
                    className="h-full flex flex-col items-center justify-center py-6"
                  >
                    <FaCheckCircle className="w-20 h-20 text-emerald-500 drop-shadow mb-3" />
                    <div className="text-xl font-semibold text-gray-800">Onaylandı</div>
                    <div className="text-sm text-gray-600">İlanınız başarıyla yayınlandı</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
