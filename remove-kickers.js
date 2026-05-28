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
    
    // Use a regex to find lines containing className="kicker..."
    // Specifically looking for <p className="kicker...">text</p>
    // Sometimes it might span multiple lines if it has complex children, but mostly it's single line.
    
    // First, let's try a regex that matches `<p className="kicker[^>]*>[\s\S]*?<\/p>`
    // Wait, regex for HTML is bad if nested, but <p> tags are rarely nested.
    const newContent = content.replace(/[\t ]*<p className="kicker[^>]*>[\s\S]*?<\/p>\n?/g, '');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
        console.log('Updated', file);
    }
}

console.log(`Updated ${count} files.`);
