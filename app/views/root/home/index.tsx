import Link from "next/link";
import IlanSearch from "@app/components/ilan-search";
import FeaturesSection from "./features";
import HowItWorksSection from "./how-it-works";
import AnimatedCounter from "./animated-counter";

// Category tipini genişleterek listingCount ve children özelliklerini ekleyelim
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
export default function HomePage({ categories, listingsCount, dailyListingsCount }: { categories: CategoryWithCount[]; listingsCount: number; dailyListingsCount: number }) {
  // Ana kategoriler (parentId null olanlar)
  const mainCategories = Array.isArray(categories)
    ? categories.filter((c) => !c.parentId)
    : [];

  // Alt kategorilerin toplam ilan sayısını hesaplayan fonksiyon
  const getSubcategoryListingCount = (mainCategory: CategoryWithCount) => {
    return (
      mainCategory.children?.reduce(
        (total, subCat) => total + (subCat.listingCount || 0),
        0
      ) || 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Futuristic SaaS Design */}
      <div className="relative bg-slate-950 py-32 min-h-[500px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-500/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/site-bg.jpg')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        </div>
        
        <div className="relative w-full max-w-[1800px] mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">Solutions</span>
            </h1>
            <p className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto text-slate-300 font-light">
              Elevate your operations with our next-generation platform. Scalable, secure, and built for modern teams.
            </p>

            {/* Arama formu bölümü - Search Section */}
            <IlanSearch categories={categories} />
            
            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  {/* <div className="text-2xl font-bold">10,000+</div> */}
                  <AnimatedCounter 
                    from={0} 
                    to={10000} 
                    suffix="+" 
                    className="text-2xl font-bold"
                    duration={2.5}
                  />
                  <div className="text-sm opacity-80">Aktif Kullanıcı</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2 2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-left">
                  {/* <div className="text-2xl font-bold">50,000+</div> */}
                  <AnimatedCounter 
                    from={0} 
                    to={listingsCount + 10000} //aktif ilan sayısı + 10000
                    suffix="+" 
                    className="text-2xl font-bold"
                    duration={2.5}
                  />
                  <div className="text-sm opacity-80">Aktif İlan</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">{dailyListingsCount}</div>
                  <div className="text-sm opacity-80">Bugün Eklenen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seamless transition: rely on subtle hero fade */}

      {/* Categories Section - seamless with page background */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-[1800px] mx-auto px-4 pt-8 pb-16 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tüm Kategoriler</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">İhtiyacınız olan her şeyi kolayca bulun. Binlerce ilan arasından size en uygun olanı seçin.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainCategories.map((mainCategory: CategoryWithCount) => {
              const totalSubcategoryListings = getSubcategoryListingCount(mainCategory);
              const totalListings = (mainCategory.listingCount || 0) + totalSubcategoryListings;
              if(mainCategory.children.length === 0) return null;
              return (
                <div key={mainCategory.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Link
                        href={`/category/${mainCategory.slug}`}
                        className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {mainCategory.name}
                      </Link>
                      {totalListings > 0 && (
                        <span className="bg-rose-100 text-rose-800 text-sm font-medium px-3 py-1 rounded-full">
                          {totalListings} kayıt
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {mainCategory.children
                        ?.sort((a, b) => {
                          // İlan sayısı büyükten küçüğe (ilan olanlar üstte)
                          const listingCountDiff = (b.listingCount || 0) - (a.listingCount || 0);
                          if (listingCountDiff !== 0) return listingCountDiff;
                          // İlan sayıları eşitse order'a göre sırala
                          return a.order - b.order;
                        })
                        .map((subCategory: CategoryWithCount) => (
                          <Link
                            key={subCategory.id}
                            href={`/category/${subCategory.slug}`}
                            className="flex items-center justify-between text-gray-600 hover:text-indigo-600 transition-colors"
                          >
                            <span>{subCategory.name}</span>
                            {subCategory.listingCount > 0 && (
                              <span className="text-sm text-gray-500 mr-2">
                                {subCategory.listingCount}
                              </span>
                            )}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <div className="relative overflow-hidden py-24 md:py-32 bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl" />
        </div>
        <div className="relative w-full max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-slate-300 text-lg mb-10">Join thousands of enterprises driving innovation with our platform.</p>
          <Link
            href="/add-listing"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 transition-opacity shadow-xl shadow-indigo-900/20"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}