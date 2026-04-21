const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /"\/yonetim/g, to: "\"/management" },
  { from: /'\/yonetim/g, to: "'/management" },
  { from: /`\/yonetim/g, to: "`/management" },
  
  { from: /\/anasayfa/g, to: "/dashboard" },
  { from: /\/aktif-ilanlar/g, to: "/active-listings" },
  { from: /\/onay-bekleyen-ilanlar/g, to: "/pending-listings" },
  { from: /\/pasif-ilanlar/g, to: "/inactive-listings" },
  { from: /\/sikayetler/g, to: "/complaints" },
  { from: /\/kategoriler/g, to: "/categories" },
  { from: /\/iletisim-mesajlari/g, to: "/contact-messages" },
  { from: /\/tum-mesajlar/g, to: "/all-messages" },
  { from: /\/ilan-mesaj-detayi/g, to: "/listing-message-detail" },
  
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
  
  // Also common imports or paths
  { from: /@app\/views\/admin\/aktif-ilanlar/g, to: "@app/views/admin/active-listings" },
  { from: /@app\/views\/admin\/anasayfa/g, to: "@app/views/admin/home" },
  { from: /@app\/views\/admin\/ayarlar/g, to: "@app/views/admin/settings" },
  { from: /@app\/views\/admin\/ilan/g, to: "@app/views/admin/listing" },
  { from: /@app\/views\/admin\/ilan-mesaj-detayi/g, to: "@app/views/admin/listing-message-detail" },
  { from: /@app\/views\/admin\/kategoriler/g, to: "@app/views/admin/categories" },
  { from: /@app\/views\/admin\/onay-bekleyen-ilanlar/g, to: "@app/views/admin/pending-listings" },
  { from: /@app\/views\/admin\/pasif-ilanlar/g, to: "@app/views/admin/inactive-listings" },
  { from: /@app\/views\/admin\/sikayetler/g, to: "@app/views/admin/complaints" },
  { from: /@app\/views\/admin\/tum-mesajlar/g, to: "@app/views/admin/all-messages" },
  
  { from: /@app\/views\/root\/favorilerim/g, to: "@app/views/root/favorites" },
  { from: /@app\/views\/root\/ilan-detay/g, to: "@app/views/root/listing-detail" },
  { from: /@app\/views\/root\/ilan-duzenle/g, to: "@app/views/root/edit-listing" },
  { from: /@app\/views\/root\/ilan-ekle/g, to: "@app/views/root/add-listing" },
  { from: /@app\/views\/root\/iletisim/g, to: "@app/views/root/contact" },
  { from: /@app\/views\/root\/mesaj-detay/g, to: "@app/views/root/message-detail" },
  { from: /@app\/views\/root\/mesajlar/g, to: "@app/views/root/messages-list" },
  { from: /@app\/views\/root\/odeme/g, to: "@app/views/root/payment" }
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
console.log('Finished updating code references.');
