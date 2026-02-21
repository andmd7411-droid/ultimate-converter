import JSZip from 'jszip';
import { DocumentEngine } from './DocumentEngine';

export class EbookEngine {
    static async convertEpub(file: File, targetFormat: string): Promise<Blob> {
        const zip = new JSZip();
        await zip.loadAsync(file);

        // Find content files (html, xhtml, xml, htm) 
        // Ignoring metadata and structural files
        const contentFiles = Object.keys(zip.files).filter(name =>
            !name.includes('META-INF') &&
            !name.endsWith('.opf') &&
            !name.endsWith('.ncx') &&
            !name.endsWith('.css') &&
            !name.match(/\.(jpg|jpeg|png|gif|svg|woff|ttf)$/i) &&
            name.match(/\.(html|xhtml|htm|xml)/i)
        );

        let fullText = '';
        for (const name of contentFiles) {
            let content = await zip.files[name].async('string');

            // Remove TOC / Document Outlines that clutter the end of the text
            content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
            content = content.replace(/<h[1-6][^>]*>(?:Document Outline|Table of Contents)<\/h[1-6]>[\s\S]*?<\/ul>/gi, '');

            // Mark illustrations and explicit anchors as explicit page breaks 
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
            // Fallback: extract any text from XML/XHTML files
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

        if (fullText.trim().length === 0) {
            throw new Error("Nu s-a putut extrage text din acest EPUB. Poate fi protejat prin DRM sau formatul este invalid.");
        }

        if (targetFormat === 'PDF') {
            const cleanText = fullText.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\n\s*\n/g, '\n\n');
            return DocumentEngine.toPDF(cleanText, file.name);
        } else if (targetFormat === 'TXT') {
            return DocumentEngine.convertText(fullText, 'TXT');
        } else if (targetFormat === 'MD') {
            return DocumentEngine.convertText(fullText, 'MD');
        }

        throw new Error("Format nesuportat pentru E-book Studio");
    }
}
