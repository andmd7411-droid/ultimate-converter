export class VectorEngine {
    static async optimizeSvg(file: File): Promise<Blob> {
        let svgContent = await file.text();

        try {
            // Very basic SVG optimizations using regex
            // 1. Remove comments
            svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, '');

            // 2. Remove metadata tags
            svgContent = svgContent.replace(/<metadata[\s\S]*?<\/metadata>/g, '');

            // 3. Remove title/desc tags (optional, often removed in minification)
            svgContent = svgContent.replace(/<title[\s\S]*?<\/title>/g, '');
            svgContent = svgContent.replace(/<desc[\s\S]*?<\/desc>/g, '');

            // 4. Remove empty attributes and inline styles that are empty
            svgContent = svgContent.replace(/\s*[a-zA-Z-0-9]+=""/g, '');
            svgContent = svgContent.replace(/style=""/g, '');

            // 5. Remove extra whitespace and newlines between tags
            svgContent = svgContent.replace(/>\s+</g, '><').trim();

            return new Blob([svgContent], { type: 'image/svg+xml' });
        } catch (error) {
            throw new Error(`SVG Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
