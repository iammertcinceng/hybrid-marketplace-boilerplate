const fs = require('fs');
const path = require('path');

const map = {
  // Common UI labels (Turkish -> English)
  'Gelen Mesajlar': 'Inbox',
  'Gönderilen Mesajlar': 'Sent Messages',
  'İlanlarım': 'My Listings',
  'Favorilerim': 'Favorites',
  'Profilim': 'My Profile',
  'Ana Sayfa': 'Home',
  'İletişim': 'Contact',
  'Çıkış Yap': 'Logout',
  'Giriş Yap': 'Login',
  'Kayıt Ol': 'Register',
  'Ücretsiz İlan Ver': 'Post Free Listing',
  'İlanlarda ara': 'Search listings',
  'Aktif İlanlar': 'Active Listings',
  'Onay Bekleyen İlanlar': 'Pending Listings',
  'Pasif İlanlar': 'Inactive Listings',
  'İlan İşlemleri': 'Listing Operations',
  'Ayarlar': 'Settings',
  'Yönetim Paneli': 'Admin Panel',
  'Başarılı': 'Success',
  'Hata': 'Error',
  'Konuşma başarıyla silindi': 'Conversation deleted successfully',
  'Konuşma silinirken bir hata oluştu': 'An error occurred while deleting conversation',
  'İlan reddedildi': 'Listing rejected',
  'İlan pasife alındı': 'Listing deactivated',
  'İlan ve ilgili tüm veriler silindi': 'Listing and all related data deleted',
  'Kategori seçin': 'Select Category',
  'Şehir seçin': 'Select City',
  'Tüm Kategoriler': 'All Categories',
  'Tüm Şehirler': 'All Cities'
};

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(file)) {
                walk(fullPath);
            }
        } else {
            if (extensions.includes(path.extname(file))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let changed = false;
                for (const [tr, en] of Object.entries(map)) {
                    // Replace text inside quotes or JSX tags
                    const regex = new RegExp(`(?<=[>'"\s])${tr}(?=[<'"\s])`, 'g');
                    if (regex.test(content)) {
                        content = content.replace(regex, en);
                        changed = true;
                    }
                }
                
                // Also handle relative imports to path aliases
                // e.g. import ... from "../../../components/ui/button" -> "@/components/ui/button"
                const relativeImportRegex = /import\s+(.+)\s+from\s+["'](\.\.\/)+(components|hooks|redux|lib|utils|types|providers)\/(.+)["']/g;
                const newContent = content.replace(relativeImportRegex, 'import $1 from "@app/$3/$4"');
                if (newContent !== content) {
                    content = newContent;
                    changed = true;
                }

                if (changed) {
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated content in ${fullPath}`);
                }
            }
        }
    });
}

walk('.');
console.log('Finished UI translation and import standardization.');
