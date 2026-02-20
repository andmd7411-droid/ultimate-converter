export class FontEngine {
    static async generateWebFontCss(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const formatMap: Record<string, string> = {
                'ttf': 'truetype',
                'woff': 'woff',
                'woff2': 'woff2',
                'otf': 'opentype'
            };
            const format = formatMap[ext || ''] || 'truetype';

            // Clean filename to use as font-family name
            const fontFamily = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'CustomFont';

            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result as string;
                const cssContent = `@font-face {
    font-family: '${fontFamily}';
    src: url('${base64Data}') format('${format}');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

/* 
 * How to use this web font:
 * 1. Save this file as '${fontFamily}.css'
 * 2. Link it in your HTML: <link rel="stylesheet" href="${fontFamily}.css">
 * 3. Use it in your CSS: 
 *    .my-element { font-family: '${fontFamily}', sans-serif; }
 */
`;
                resolve(new Blob([cssContent], { type: 'text/css' }));
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
