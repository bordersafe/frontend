import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const frontendAppDir = path.join(process.cwd(), 'app');
const files = walkDir(frontendAppDir);

let count = 0;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Replace inline tailwind kickers
    // e.g. <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Buyer dashboard</p>
    const regex = /[\t ]*<p className="text-xs uppercase tracking-\[[^\]]+\] text-\(--ink-soft\)">.*?<\/p>\n?/g;
    
    const newContent = content.replace(regex, '');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
        console.log('Updated', file);
    }
}

console.log(`Updated ${count} files.`);
