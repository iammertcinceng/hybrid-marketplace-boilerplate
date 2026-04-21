const fs = require('fs');
const path = require('path');

const map = {
  // Routes in strings
  '/yonetim': '/management',
  '/anasayfa': '/dashboard',
  '/ilanlar': '/listings',
  '/aktif-ilanlar': '/active-listings',
  '/onay-bekleyen-ilanlar': '/pending-listings',
  '/pasif-ilanlar': '/inactive-listings',
  '/sikayetler': '/complaints',
  '/kategoriler': '/categories',
  '/tum-mesajlar': '/all-messages',
  '/iletisim-mesajlari': '/contact-messages',
  '/admin-pin-degistir': '/admin-pin-change',
  '/arama': '/search',
  '/ilan-ekle': '/add-listing',
  '/ilan-duzenle': '/edit-listing',
  '/favorilerim': '/favorites',
  '/profilim': '/profile',
  '/iletisim': '/contact',
  '/odeme': '/payment',
  '/sozlesmeler': '/agreements',
  '/kurumsal': '/corporate',
  '/premium-uye-ol': '/premium-signup',
  '/premium-uyelik': '/premium-membership'
};

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

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
                    // Match with quotes or slashes
                    const regex = new RegExp(`(['"\`/])${tr.slice(1)}(['"/\`])`, 'g');
                    if (regex.test(content)) {
                        content = content.replace(regex, `$1${en.slice(1)}$2`);
                        changed = true;
                    }
                }
                if (changed) {
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated routes in ${fullPath}`);
                }
            }
        }
    });
}

walk('.');
console.log('Finished updating routes.');
