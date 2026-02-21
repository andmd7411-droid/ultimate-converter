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
            const content = await zip.files[name].async('string');
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

            if (bodyMatch) {
                fullText += bodyMatch[1] + '\n\n';
            } else if (!name.endsWith('.xml')) {
                fullText += content + '\n\n';
            }
        }

        if (fullText.trim().length === 0) {
            // Fallback: extract any text from XML/XHTML files
            for (const name of contentFiles) {
                const content = await zip.files[name].async('string');
                const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
                fullText += clean + '\n\n';
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
