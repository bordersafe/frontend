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
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const frontendAppDir = path.join(process.cwd(), 'app');
const files = walkDir(frontendAppDir);

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<h1') || lines[i].includes('<h2')) {
            // Look at 1 to 3 lines before
            const prev1 = i > 0 ? lines[i-1].trim() : '';
            const prev2 = i > 1 ? lines[i-2].trim() : '';
            
            // Check if there's an element right before the header that looks like a badge or kicker
            // Like `<p className="`, `<div className="badge`, `<span`
            if (prev1.startsWith('<p ') || prev1.startsWith('<span ') || prev1.startsWith('<div className="inline') || prev1.includes('kicker') || prev1.includes('badge')) {
                // exclude empty divs or simple structure
                if (!prev1.includes('<div className="flex') && !prev1.includes('<div className="space-y')) {
                    console.log(`[${file}] line ${i+1}:`);
                    console.log(`  prev: ${prev1}`);
                    console.log(`  curr: ${lines[i].trim()}`);
                }
            }
        }
    }
}
