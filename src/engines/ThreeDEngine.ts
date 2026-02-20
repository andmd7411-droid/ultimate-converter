export class ThreeDEngine {
    static async optimize(file: File): Promise<Blob> {
        let content = await file.text();
        const originalExt = file.name.split('.').pop()?.toUpperCase() ?? '';

        try {
            if (originalExt !== 'OBJ') {
                throw new Error("Only .OBJ format is supported right now");
            }

            // Basic OBJ Optimizer / Minifier
            // 1. Remove comments
            content = content.replace(/^#.*\n/gm, '');

            // 2. Remove extra spaces
            content = content.replace(/ +/g, ' ');

            // 3. Round float coordinates to 4 decimal places to save massive amounts of space
            content = content.replace(/(\-?\d+\.\d{5,})/g, (match) => {
                return parseFloat(match).toFixed(4).replace(/\.?0+$/, ''); // Strip trailing zeroes
            });

            // 4. Remove empty lines
            content = content.replace(/^\s*[\r\n]/gm, '');

            return new Blob([content], { type: 'text/plain;charset=utf-8' });
        } catch (error) {
            throw new Error(`3D Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
