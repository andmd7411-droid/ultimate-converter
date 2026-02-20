import JSZip from 'jszip';
import { DocumentEngine } from './DocumentEngine';

export class EbookEngine {
    static async convertEpub(file: File, targetFormat: string): Promise<Blob> {
        const zip = new JSZip();
        await zip.loadAsync(file);

        // Very basic approach: find all HTML-like files and concatenate them
        // A truly robust parser would parse container.xml, content.opf, and spine.
        const htmlFiles = Object.keys(zip.files).filter(name =>
            name.endsWith('.html') || name.endsWith('.xhtml') || name.endsWith('.htm')
        );

        let fullText = '';
        for (const name of htmlFiles) {
            const content = await zip.files[name].async('string');
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            const html = bodyMatch ? bodyMatch[1] : content;
            fullText += html + '\n\n';
        }

        if (fullText.trim().length === 0) {
            throw new Error("Nu s-a putut extrage text din acest EPUB. Poate fi protejat prin DRM.");
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
