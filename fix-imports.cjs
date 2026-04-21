const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(path.basename(file))) {
                results = results.concat(walk(file));
            }
        } else {
            if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file))) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;
    
    if (c.includes('import React from "react"')) {
        c = c.replace(/import React from "react"/g, 'import * as React from "react"');
        changed = true;
    }
    if (c.includes("import React from 'react'")) {
        c = c.replace(/import React from 'react'/g, "import * as React from 'react'");
        changed = true;
    }
    
    if (c.includes('import sharp from "sharp"')) {
        c = c.replace(/import sharp from "sharp"/g, 'import * as sharp from "sharp"');
        changed = true;
    }
    if (c.includes("import sharp from 'sharp'")) {
        c = c.replace(/import sharp from 'sharp'/g, "import * as sharp from 'sharp'");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, c);
        console.log(`Fixed imports in: ${f}`);
    }
});
