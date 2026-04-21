"use client";

import { motion } from "framer-motion";

export default function HowItWorksSection() {
  return (
    <div className="relative bg-transparent py-16">
      {/* top overlay to blend with Features bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-10 bg-gradient-to-t from-transparent to-white/70" />
      <div className="w-full max-w-[1800px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Sadece birkaç adımda ilanınızı yayınlayın veya aradığınızı bulun.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 - İlan Oluştur */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm text-center group hover:shadow-lg transition-all duration-200 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ y: -8 }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
            />
            
            {/* Step number */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              1
            </motion.div>

            <motion.div 
              className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">İlan Oluştur</h3>
            <p className="text-gray-600 relative z-10">Satmak veya kiralamak istediğiniz ürün veya hizmet için detaylı bir ilan oluşturun.</p>
          </motion.div>
          
          {/* Step 2 - Keşfet */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm text-center group hover:shadow-lg transition-all duration-200 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ y: -8 }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
            />
            
            {/* Step number */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              2
            </motion.div>

            <motion.div 
              className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
              whileHover={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Keşfet</h3>
            <p className="text-gray-600 relative z-10">Binlerce ilan arasından aradığınızı kolayca bulun ve iletişime geçin.</p>
          </motion.div>
          
          {/* Step 3 - İletişime Geç */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm text-center group hover:shadow-lg transition-all duration-200 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ y: -8 }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={false}
            />
            
            {/* Step number */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            >
              3
            </motion.div>

            <motion.div 
              className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200"
              whileHover={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.3 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">İletişime Geç</h3>
            <p className="text-gray-600 mb-4 relative z-10">İlan sahipleriyle doğrudan mesajlaşarak detayları konuşun ve anlaşın.</p>
            
            {/* Mesajlaşma Özellikleri - Animasyonlu İkonlar */}
            <motion.div 
              className="flex justify-center items-center space-x-4 mt-4 pt-4 border-t border-gray-100 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <motion.div 
                className="group/icon flex flex-col items-center"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1 group-hover/icon:bg-blue-100 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Ses</span>
              </motion.div>
              
              <motion.div 
                className="group/icon flex flex-col items-center"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              >
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-1 group-hover/icon:bg-green-100 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Fotoğraf</span>
              </motion.div>
              
              <motion.div 
                className="group/icon flex flex-col items-center"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-1 group-hover/icon:bg-orange-100 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Dosya</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
