const fs = require('fs');
const path = require('path');

const map = {
    // Admin
    'yonetim': 'management',
    'aktif-ilanlar': 'active-listings',
    'aktifilanlar': 'active-listings',
    'anasayfa': 'dashboard',
    'ayarlar': 'settings',
    'kategoriler': 'categories',
    'onay-bekleyen-ilanlar': 'pending-listings',
    'onaybekleyenilanlar': 'pending-listings',
    'pasif-ilanlar': 'inactive-listings',
    'pasifilanlar': 'inactive-listings',
    'sikayetler': 'complaints',
    'tum-mesajlar': 'all-messages',
    'tummesajlar': 'all-messages',
    'ilan-mesaj-detayi': 'listing-message-detail',
    'ilanmesajdetayi': 'listing-message-detail',
    'iletisim-mesajlari': 'contact-messages',
    'dokumantasyon': 'documentation',
    
    // Root
    'kategori': 'category',
    'ilan': 'listing',
    'ilan-ekle': 'add-listing',
    'ilan-duzenle': 'edit-listing',
    'favorilerim': 'favorites',
    'ilanlarim': 'my-listings',
    'profilim': 'profile',
    'iletisim': 'contact',
    'kurumsal': 'corporate',
    'sozlesmeler': 'agreements',
    'odeme': 'payment',
    'gelen-mesajlar': 'inbox',
    'gonderilen-mesajlar': 'sent-messages',
    'arama': 'search',
    'premium-uye-ol': 'premium-signup',
    'premium-uyelik': 'premium-membership',
    'mesaj-detay': 'message-detail',
    'mesajlar': 'messages-list',
    'ilan-detay': 'listing-detail'
};

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [tr, en] of Object.entries(map)) {
        // More robust but simpler replacement logic
        // Look for the turkish name surrounded by characters that signify it's a path or part of a path
        
        // 1. Matches like /yonetim/ or /yonetim" or /yonetim' or /yonetim`
        const slashPattern = new RegExp(`(/)${tr}(?=[/"'\`])`, 'g');
        let newContent = content.replace(slashPattern, `$1${en}`);
        
        // 2. Matches at the start of a quote (relative imports like "./yonetim")
        const quotePattern = new RegExp(`(["'\`.]/)${tr}(?=[/"'\`])`, 'g');
        newContent = newContent.replace(quotePattern, `$1${en}`);

        // 3. Matches in @-aliases or internal view paths
        const aliasPattern = new RegExp(`(@[a-zA-Z0-9_-]*/views/(admin|root)/)${tr}(?=[/"'\`])`, 'g');
        newContent = newContent.replace(aliasPattern, `$1${en}`);

        // 4. Case where it's the last part of a path in a string
        const endPathPattern = new RegExp(`(/)${tr}(?=["'\`])`, 'g');
        newContent = newContent.replace(endPathPattern, `$1${en}`);

        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(file)) {
                walk(fullPath);
            }
        } else if (extensions.includes(path.extname(file))) {
            updateFile(fullPath);
        }
    }
}

walk('.');
console.log('Update complete.');
