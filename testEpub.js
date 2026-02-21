import fs from 'fs';
import JSZip from 'jszip';

async function testEpub() {
    const filePath = 'C:/Users/andre/Downloads/Accusee, levez-vous ! - Cyrille Largillier.epub';
    const fileBuf = fs.readFileSync(filePath);

    const zip = new JSZip();
    await zip.loadAsync(fileBuf);

    const contentFiles = Object.keys(zip.files).filter(name =>
        !name.includes('META-INF') &&
        !name.endsWith('.opf') &&
        !name.endsWith('.ncx') &&
        !name.endsWith('.css') &&
        !name.match(/\.(jpg|jpeg|png|gif|svg|woff|ttf)$/i) &&
        name.match(/\.(html|xhtml|htm|xml)/i)
    );

    console.log("Found content files:", contentFiles);
    fs.writeFileSync('C:/Users/andre/OneDrive/Bureau/444 app multe/testEpubFiles.txt', contentFiles.join('\n'));

    let fullText = '';
    for (const name of contentFiles) {
        let content = await zip.files[name].async('string');

        content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
        content = content.replace(/<h[1-6][^>]*>(?:Document Outline|Table of Contents)<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');

        content = content
            .replace(/<a[^>]*id="p\d+"[^>]*>/gi, '\n\n---PAGE_BREAK---\n')
            .replace(/<div(?:[^>]+)class="page_number[^>]*>([\s\S]*?)<\/div>/gi, '\n\n---PAGE_BREAK---\n[$1]\n\n')
            .replace(/<img[^>]*>/gi, '\n\n[Imagine/Ilustrație]\n\n')
            .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '\n\n[Ilustrație SVG]\n\n')
            .replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, '\n\n---PAGE_BREAK---\n$1\n\n');

        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

        if (bodyMatch) {
            fullText += bodyMatch[1] + '\n\n---PAGE_BREAK---\n\n';
        } else if (!name.endsWith('.xml')) {
            fullText += content + '\n\n---PAGE_BREAK---\n\n';
        }
    }

    if (fullText.trim().length === 0) {
        for (const name of contentFiles) {
            let content = await zip.files[name].async('string');
            content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
            content = content.replace(/<h[1-6][^>]*>(?:Document Outline|Table of Contents)<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');
            content = content
                .replace(/<a[^>]*id="p\d+"[^>]*>/gi, '\n\n---PAGE_BREAK---\n')
                .replace(/<div(?:[^>]+)class="page_number[^>]*>([\s\S]*?)<\/div>/gi, '\n\n---PAGE_BREAK---\n[$1]\n\n')
                .replace(/<img[^>]*>/gi, '\n\n[Imagine/Ilustrație]\n\n')
                .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '\n\n[Ilustrație SVG]\n\n')
                .replace(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, '\n\n---PAGE_BREAK---\n$1\n\n');

            const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            fullText += clean + '\n\n---PAGE_BREAK---\n\n';
        }
    }

    // Now strip all remaining HTML to simulate the text conversion pipeline
    let finalText = fullText
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        // Remove excessive empty lines
        .replace(/\n\s*\n\s*\n/g, '\n\n');

    console.log("Total Clean Text length:", finalText.length);
    fs.writeFileSync('C:/Users/andre/OneDrive/Bureau/444 app multe/testEpubLog.txt', finalText);
}

testEpub().catch(console.error);
