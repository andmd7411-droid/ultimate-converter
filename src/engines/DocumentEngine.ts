import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
// Initialize PDF.js worker using Vite's URL import
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class DocumentEngine {
    /**
     * Converts a text-based file or mixed blocks to PDF with high fidelity.
     */
    static async toPDF(content: string | import('../types').DocumentBlock[], _title: string = 'Document'): Promise<Blob> {
        const doc = new jsPDF();
        doc.setFontSize(11);

        let blocks: import('../types').DocumentBlock[];

        if (typeof content === 'string') {
            const pagesRaw = content.split('---PAGE_BREAK---');
            blocks = [];
            for (let i = 0; i < pagesRaw.length; i++) {
                if (i > 0) blocks.push({ type: 'page_break' });
                if (pagesRaw[i].trim()) blocks.push({ type: 'text', content: pagesRaw[i] });
            }
        } else {
            blocks = content;
        }

        let cursorY = 20;
        let isFirstPage = true;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const lineHeight = 6; // Approx line height for font size 11

        for (const block of blocks) {
            if (block.type === 'page_break') {
                if (!isFirstPage) {
                    doc.addPage();
                    cursorY = 20;
                }
                // we don't set isFirstPage to false here, because multiple consecutive page breaks on page 1 should be ignored
            } else if (block.type === 'text' && typeof block.content === 'string') {
                const trimmed = block.content.trim();
                if (!trimmed) continue;

                const splitText = doc.splitTextToSize(trimmed, pageWidth - margin * 2);

                for (let i = 0; i < splitText.length; i++) {
                    if (cursorY > pageHeight - margin) {
                        doc.addPage();
                        cursorY = 20;
                    }
                    isFirstPage = false;
                    doc.text(splitText[i], margin, cursorY);
                    cursorY += lineHeight;
                }
                cursorY += 4; // Spacing after paragraph
            } else if (block.type === 'image' && block.content instanceof Blob) {
                const imgData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(block.content as Blob);
                });

                const img = new Image();
                img.src = imgData;
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                });

                let availHeight = pageHeight - cursorY - margin;
                if (availHeight < 40 && !isFirstPage) {
                    doc.addPage();
                    cursorY = 20;
                    availHeight = pageHeight - margin * 2;
                }
                isFirstPage = false;

                const maxImgWidth = pageWidth - margin * 2;
                const ratio = Math.min(maxImgWidth / img.width, availHeight / img.height);
                const imgWidth = img.width * ratio;
                const imgHeight = img.height * ratio;
                const x = (pageWidth - imgWidth) / 2;

                const mime = block.content.type || 'image/jpeg';
                const fmt = block.format || (mime.includes('png') ? 'PNG'
                    : mime.includes('jpg') || mime.includes('jpeg') ? 'JPEG'
                        : mime.includes('webp') ? 'WEBP' : 'JPEG');

                try {
                    doc.addImage(imgData, fmt, x, cursorY, imgWidth, imgHeight);
                } catch {
                    doc.addImage(imgData, 'JPEG', x, cursorY, imgWidth, imgHeight);
                }
                cursorY += imgHeight + 8; // Spacing after image
            }
        }

        if (isFirstPage) {
            doc.text("Acest document nu conține text sau imagini recunoscute.", margin, cursorY);
        }

        return doc.output('blob');
    }

    /**
     * Extracts PDF pages to images (Returns ZIP if multiple pages, else single Blob).
     */
    static async pdfToImages(file: File, format: string): Promise<Blob> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg';
        const ext = format === 'PNG' ? 'png' : 'jpg';
        const blobs: { name: string, blob: Blob }[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // High res
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            // White background for JPEG
            if (format === 'JPG' || format === 'JPEG') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            await page.render({ canvasContext: ctx, viewport } as any).promise;

            const blob = await new Promise<Blob | null>(resolve =>
                canvas.toBlob(resolve, mimeType, 0.95)
            );
            if (blob) {
                blobs.push({ name: `page-${i}.${ext}`, blob });
            }
        }

        if (blobs.length === 1) {
            return blobs[0].blob; // Just return the single image
        }

        // Multiple images: zip them
        const zip = new JSZip();
        blobs.forEach(b => zip.file(b.name, b.blob));
        return await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/zip',
            compression: 'DEFLATE'
        });
    }

    /**
     * Converts multiple image files to a single PDF.
     */
    static async imagesToPDF(files: File[]): Promise<Blob> {
        const doc = new jsPDF();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const imgData = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const img = new Image();
            img.src = imgData;
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
            });

            if (i > 0) doc.addPage();

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const ratio = Math.min((pageWidth - 20) / img.width, (pageHeight - 20) / img.height);
            const imgWidth = img.width * ratio;
            const imgHeight = img.height * ratio;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            const mime = file.type || 'image/jpeg';
            const fmt = mime.includes('png') ? 'PNG'
                : mime.includes('jpg') || mime.includes('jpeg') ? 'JPEG'
                    : mime.includes('webp') ? 'WEBP' : 'JPEG';

            try {
                doc.addImage(imgData, fmt, x, y, imgWidth, imgHeight);
            } catch {
                doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
            }
        }

        return doc.output('blob');
    }

    /**
     * Converts text content between TXT, MD, HTML formats.
     */
    static async convertText(content: string, targetFormat: string): Promise<Blob> {
        const fmt = targetFormat.toUpperCase();

        if (fmt === 'HTML') {
            // Convert plain text / markdown to basic HTML
            const escaped = content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Very lightweight MD-like conversion for headers, bold, italic, links
            const html = escaped
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
                .replace(/\n/g, '<br>\n');

            const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Converted Document</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; }
  h1,h2,h3 { color: #111; }
  a { color: #4f46e5; }
</style>
</head>
<body>
${html}
</body>
</html>`;
            return new Blob([fullHTML], { type: 'text/html' });
        }

        if (fmt === 'MD') {
            // Strip basic HTML tags, convert to markdown-ish text
            const md = content
                .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
                .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
                .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
                .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
                .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
                .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
                .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
                .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ');
            return new Blob([md], { type: 'text/markdown' });
        }

        // TXT: strip all HTML tags
        const txt = content
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ');
        return new Blob([txt], { type: 'text/plain' });
    }
}
