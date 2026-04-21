const fs = require('fs');
const path = require('path');

const replacements = [
  // Exact matches within quotes for relative imports or paths
  { from: /"(\.\.\/)*mesaj-detay"/g, to: (match) => match.replace("mesaj-detay", "message-detail") },
  { from: /'(\.\.\/)*mesaj-detay'/g, to: (match) => match.replace("mesaj-detay", "message-detail") },
  { from: /"(\.\.\/)*mesajlar"/g, to: (match) => match.replace("mesajlar", "messages-list") },
  { from: /'(\.\.\/)*mesajlar'/g, to: (match) => match.replace("mesajlar", "messages-list") },
  { from: /"(\.\.\/)*ilan-detay"/g, to: (match) => match.replace("ilan-detay", "listing-detail") },
  { from: /'(\.\.\/)*ilan-detay'/g, to: (match) => match.replace("ilan-detay", "listing-detail") },
  { from: /"(\.\.\/)*ilan-duzenle"/g, to: (match) => match.replace("ilan-duzenle", "edit-listing") },
  { from: /'(\.\.\/)*ilan-duzenle'/g, to: (match) => match.replace("ilan-duzenle", "edit-listing") },
  { from: /"(\.\.\/)*ilan-ekle"/g, to: (match) => match.replace("ilan-ekle", "add-listing") },
  { from: /'(\.\.\/)*ilan-ekle'/g, to: (match) => match.replace("ilan-ekle", "add-listing") },
  { from: /"(\.\.\/)*iletisim"/g, to: (match) => match.replace("iletisim", "contact") },
  { from: /'(\.\.\/)*iletisim'/g, to: (match) => match.replace("iletisim", "contact") },
  { from: /"(\.\.\/)*favorilerim"/g, to: (match) => match.replace("favorilerim", "favorites") },
  { from: /'(\.\.\/)*favorilerim'/g, to: (match) => match.replace("favorilerim", "favorites") },
  { from: /"(\.\.\/)*odeme"/g, to: (match) => match.replace("odeme", "payment") },
  { from: /'(\.\.\/)*odeme'/g, to: (match) => match.replace("odeme", "payment") },
  { from: /"(\.\.\/)*yonetim"/g, to: (match) => match.replace("yonetim", "management") },
  { from: /'(\.\.\/)*yonetim'/g, to: (match) => match.replace("yonetim", "management") },
  { from: /"(\.\.\/)*anasayfa"/g, to: (match) => match.replace("anasayfa", "home") },
  { from: /'(\.\.\/)*anasayfa'/g, to: (match) => match.replace("anasayfa", "home") },
  { from: /"(\.\.\/)*ayarlar"/g, to: (match) => match.replace("ayarlar", "settings") },
  { from: /'(\.\.\/)*ayarlar'/g, to: (match) => match.replace("ayarlar", "settings") },
  { from: /"(\.\.\/)*aktif-ilanlar"/g, to: (match) => match.replace("aktif-ilanlar", "active-listings") },
  { from: /'(\.\.\/)*aktif-ilanlar'/g, to: (match) => match.replace("aktif-ilanlar", "active-listings") },
  { from: /"(\.\.\/)*onay-bekleyen-ilanlar"/g, to: (match) => match.replace("onay-bekleyen-ilanlar", "pending-listings") },
  { from: /'(\.\.\/)*onay-bekleyen-ilanlar'/g, to: (match) => match.replace("onay-bekleyen-ilanlar", "pending-listings") },
  { from: /"(\.\.\/)*pasif-ilanlar"/g, to: (match) => match.replace("pasif-ilanlar", "inactive-listings") },
  { from: /'(\.\.\/)*pasif-ilanlar'/g, to: (match) => match.replace("pasif-ilanlar", "inactive-listings") },
  { from: /"(\.\.\/)*sikayetler"/g, to: (match) => match.replace("sikayetler", "complaints") },
  { from: /'(\.\.\/)*sikayetler'/g, to: (match) => match.replace("sikayetler", "complaints") },
  { from: /"(\.\.\/)*kategoriler"/g, to: (match) => match.replace("kategoriler", "categories") },
  { from: /'(\.\.\/)*kategoriler'/g, to: (match) => match.replace("kategoriler", "categories") },
  { from: /"(\.\.\/)*tum-mesajlar"/g, to: (match) => match.replace("tum-mesajlar", "all-messages") },
  { from: /'(\.\.\/)*tum-mesajlar'/g, to: (match) => match.replace("tum-mesajlar", "all-messages") },
  { from: /"(\.\.\/)*kategori"/g, to: (match) => match.replace("kategori", "category") },
  { from: /'(\.\.\/)*kategori'/g, to: (match) => match.replace("kategori", "category") },
  { from: /"(\.\.\/)*dokumantasyon"/g, to: (match) => match.replace("dokumantasyon", "documentation") },
  { from: /'(\.\.\/)*dokumantasyon'/g, to: (match) => match.replace("dokumantasyon", "documentation") },
  
  // Specific View Folder pattern again just in case
  { from: /"(\.\.\/)*views\//g, to: "\"$1views/" },
  { from: /'(\.\.\/)*views\//g, to: "'$1views/" },
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
            if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file))) {
                let content = fs.readFileSync(file, 'utf8');
                let changed = false;
                replacements.forEach(rep => {
                    const originalContent = content;
                    content = content.replace(rep.from, rep.to);
                    if (content !== originalContent) {
                        changed = true;
                    }
                });
                if (changed) {
                    fs.writeFileSync(file, content);
                    console.log(`Updated imports in ${file}`);
                }
            }
        }
    });
}

walk('.');
console.log('Finished deep updating of relative imports.');
