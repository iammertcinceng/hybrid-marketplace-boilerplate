const fs = require('fs');
const path = require('path');

const replacements = [
  // Directories in strings (hrefs, routes)
  { from: /\/yonetim/g, to: "/management" },
  { from: /\/aktif-ilanlar/g, to: "/active-listings" },
  { from: /\/aktifilanlar/g, to: "/active-listings" },
  { from: /\/anasayfa/g, to: "/dashboard" },
  { from: /\/ayarlar/g, to: "/settings" },
  { from: /\/onay-bekleyen-ilanlar/g, to: "/pending-listings" },
  { from: /\/onaybekleyenilanlar/g, to: "/pending-listings" },
  { from: /\/pasif-ilanlar/g, to: "/inactive-listings" },
  { from: /\/pasifilanlar/g, to: "/inactive-listings" },
  { from: /\/sikayetler/g, to: "/complaints" },
  { from: /\/kategoriler/g, to: "/categories" },
  { from: /\/iletisim-mesajlari/g, to: "/contact-messages" },
  { from: /\/tum-mesajlar/g, to: "/all-messages" },
  { from: /\/tummesajlar/g, to: "/all-messages" },
  { from: /\/ilan-mesaj-detayi/g, to: "/listing-message-detail" },
  { from: /\/ilanmesajdetayi/g, to: "/listing-message-detail" },
  { from: /\/dokumantasyon/g, to: "/documentation" },
  { from: /\/admin-pin-degistir/g, to: "/admin-pin-change" },

  { from: /\/kategori/g, to: "/category" },
  { from: /\/ilan\//g, to: "/listing/" },
  { from: /\/ilan-ekle/g, to: "/add-listing" },
  { from: /\/ilan-duzenle/g, to: "/edit-listing" },
  { from: /\/favorilerim/g, to: "/favorites" },
  { from: /\/ilanlarim/g, to: "/my-listings" },
  { from: /\/profilim/g, to: "/profile" },
  { from: /\/iletisim/g, to: "/contact" },
  { from: /\/kurumsal/g, to: "/corporate" },
  { from: /\/sozlesmeler/g, to: "/agreements" },
  { from: /\/odeme/g, to: "/payment" },
  { from: /\/gelen-mesajlar/g, to: "/inbox" },
  { from: /\/gonderilen-mesajlar/g, to: "/sent-messages" },
  { from: /\/arama/g, to: "/search" },
  { from: /\/premium-uye-ol/g, to: "/premium-signup" },
  { from: /\/premium-uyelik/g, to: "/premium-membership" },

  // View Folder Imports
  { from: /views\/admin\/anasayfa/g, to: "views/admin/home" },
  { from: /views\/admin\/aktif-ilanlar/g, to: "views/admin/active-listings" },
  { from: /views\/admin\/ayarlar/g, to: "views/admin/settings" },
  { from: /views\/admin\/ilan/g, to: "views/admin/listing" },
  { from: /views\/admin\/ilan-mesaj-detayi/g, to: "views/admin/listing-message-detail" },
  { from: /views\/admin\/kategoriler/g, to: "views/admin/categories" },
  { from: /views\/admin\/onay-bekleyen-ilanlar/g, to: "views/admin/pending-listings" },
  { from: /views\/admin\/pasif-ilanlar/g, to: "views/admin/inactive-listings" },
  { from: /views\/admin\/sikayetler/g, to: "views/admin/complaints" },
  { from: /views\/admin\/tum-mesajlar/g, to: "views/admin/all-messages" },
  
  { from: /views\/root\/favorilerim/g, to: "views/root/favorites" },
  { from: /views\/root\/ilan-detay/g, to: "views/root/listing-detail" },
  { from: /views\/root\/ilan-duzenle/g, to: "views/root/edit-listing" },
  { from: /views\/root\/ilan-ekle/g, to: "views/root/add-listing" },
  { from: /views\/root\/iletisim/g, to: "views/root/contact" },
  { from: /views\/root\/mesaj-detay/g, to: "views/root/message-detail" },
  { from: /views\/root\/mesajlar/g, to: "views/root/messages-list" },
  { from: /views\/root\/odeme/g, to: "views/root/payment" },
  { from: /views\/root\/profile/g, to: "views/root/user-profile" }
];

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(path.basename(file))) {
                walk(file);
            }
        } else {
            if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(path.extname(file))) {
                let content = fs.readFileSync(file, 'utf8');
                let changed = false;
                replacements.forEach(rep => {
                    if (rep.from.test(content)) {
                        content = content.replace(rep.from, rep.to);
                        changed = true;
                    }
                });
                if (changed) {
                    fs.writeFileSync(file, content);
                    console.log(`Updated ${file}`);
                }
            }
        }
    });
}

walk('.');
console.log('Finished comprehensive updating of code references.');
