import type { FileFormat } from '../types';

export class MinifierEngine {
    static async minify(file: File, targetFormat: FileFormat): Promise<Blob> {
        const text = await file.text();
        let minifiedText = text;

        try {
            if (targetFormat === 'JS') {
                minifiedText = this.minifyJS(text);
            } else if (targetFormat === 'CSS') {
                minifiedText = this.minifyCSS(text);
            } else if (targetFormat === 'HTML') {
                minifiedText = this.minifyHTML(text);
            } else {
                throw new Error(`Unsupported minification format: ${targetFormat}`);
            }

            const mimeType = targetFormat === 'JS' ? 'text/javascript' :
                targetFormat === 'CSS' ? 'text/css' : 'text/html';

            return new Blob([minifiedText], { type: `${mimeType};charset=utf-8` });
        } catch (error) {
            throw new Error(`Minification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private static minifyJS(code: string): string {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
            .replace(/\/\/.*/g, '')          // remove single-line comments
            .replace(/\s*([=+\-*/<>!&|{}:;,()[\]])\s*/g, '$1') // remove spaces around operators
            .replace(/\s{2,}/g, ' ')         // replace multiple spaces with single space
            .replace(/\n\s*/g, '');          // remove newlines
    }

    private static minifyCSS(css: string): string {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
            .replace(/\s*([{},;:])\s*/g, '$1') // remove spaces around punctuation
            .replace(/\s{2,}/g, ' ')         // remove extra spaces
            .trim();
    }

    private static minifyHTML(html: string): string {
        return html
            .replace(/<!--[\s\S]*?-->/g, '') // remove comments
            .replace(/>\s+</g, '><')         // remove space between tags
            .replace(/\s{2,}/g, ' ')         // remove extra spaces inside tags
            .trim();
    }
}
