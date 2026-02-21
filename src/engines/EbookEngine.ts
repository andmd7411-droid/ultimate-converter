import JSZip from 'jszip';
import { DocumentEngine } from './DocumentEngine';

export class EbookEngine {
    static async convertEpub(file: File, targetFormat: string): Promise<Blob> {
        const zip = new JSZip();
        await zip.loadAsync(file);

        // Find content files (html, xhtml, xml, htm) 
        const allFiles = Object.keys(zip.files);
        const contentFiles = allFiles.filter(name =>
            !name.includes('META-INF') &&
            !name.endsWith('.opf') &&
            !name.endsWith('.ncx') &&
            !name.endsWith('.css') &&
            !name.match(/\.(jpg|jpeg|png|gif|svg|woff|ttf)$/i) &&
            name.match(/\.(html|xhtml|htm|xml)/i)
        );

        const blocks: import('../types').DocumentBlock[] = [];

        for (const name of contentFiles) {
            let content = await zip.files[name].async('string');
            const baseDir = name.substring(0, name.lastIndexOf('/') + 1);

            // Remove non-content tags including their inner content
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
            content = content.replace(/<metadata[^>]*>[\s\S]*?<\/metadata>/gi, '');
            content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
            content = content.replace(/<h[1-6][^>]*>(?:Document Outline|Table of Contents)<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');
            content = content.replace(/@page\s*{[^}]*}/gi, '');

            // We'll use a regex to split content by tags of interest (img, a id=p, h1-h3, div page_number)
            // This is safer than replacing with string markers because we need to extract binary data for images
            const regex = /(<img[^>]+>|<image[^>]+>|<a[^>]*id="p\d+"[^>]*>|<div(?:[^>]+)class="page_number[^>]*>[\s\S]*?<\/div>|<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>)/gi;
            const parts = content.split(regex);

            for (const part of parts) {
                if (!part) continue;

                if (part.match(/<a[^>]*id="p\d+"[^>]*>/i) || part.match(/<h[1-3][^>]*>/i)) {
                    blocks.push({ type: 'page_break' });
                    if (part.match(/<h[1-3][^>]*>/i)) {
                        const text = part.replace(/<[^>]+>/g, ' ').trim();
                        if (text) blocks.push({ type: 'text', content: text });
                    }
                } else if (part.match(/<div(?:[^>]+)class="page_number/i)) {
                    const text = part.replace(/<[^>]+>/g, ' ').trim();
                    blocks.push({ type: 'page_break' });
                    if (text) blocks.push({ type: 'text', content: `[${text}]` });
                } else if (part.match(/<img|<image/i)) {
                    // Extract src
                    let src = '';
                    const srcMatch = part.match(/src=["']([^"']+)["']/i) || part.match(/href=["']([^"']+)["']/i) || part.match(/xlink:href=["']([^"']+)["']/i);
                    if (srcMatch) src = srcMatch[1];

                    if (src) {
                        try {
                            // Resolve path
                            const fullPath = new URL(src, 'http://localhost/' + baseDir).pathname.substring(1);
                            const imgFile = zip.files[fullPath] || zip.files[decodeURIComponent(fullPath)];

                            if (imgFile) {
                                const blob = await imgFile.async('blob');
                                blocks.push({ type: 'image', content: blob });
                            }
                        } catch (e) {
                            console.warn("Could not load EPUB image:", src, e);
                        }
                    }
                } else {
                    // Text segment
                    const text = part.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    if (text) {
                        blocks.push({ type: 'text', content: text });
                    }
                }
            }
            blocks.push({ type: 'page_break' });
        }

        if (blocks.length === 0) {
            throw new Error("Nu s-a putut extrage text sau imagini din acest EPUB. Poate fi protejat prin DRM sau formatul este invalid.");
        }

        if (targetFormat === 'PDF') {
            return DocumentEngine.toPDF(blocks, file.name);
        } else if (targetFormat === 'TXT' || targetFormat === 'MD') {
            // Reconstruct text for simple formats
            let fullText = '';
            for (const b of blocks) {
                if (b.type === 'text') fullText += b.content + '\n\n';
                else if (b.type === 'image') fullText += '[Imagine/Ilustrație]\n\n';
                else if (b.type === 'page_break') fullText += '\n---PAGE_BREAK---\n';
            }
            return DocumentEngine.convertText(fullText, targetFormat);
        }

        throw new Error("Format nesuportat pentru E-book Studio");
    }
}
