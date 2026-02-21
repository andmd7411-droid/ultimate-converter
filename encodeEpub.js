import fs from 'fs';

// This script will read the Accusee epub and convert it to a base64 string
// that the browser subagent can inject into the dropzone
const file = fs.readFileSync('C:/Users/andre/Downloads/Accusee, levez-vous ! - Cyrille Largillier.epub');
const b64 = file.toString('base64');
fs.writeFileSync('C:/Users/andre/OneDrive/Bureau/444 app multe/epub_b64.txt', b64);
console.log("Base64 size:", b64.length);
