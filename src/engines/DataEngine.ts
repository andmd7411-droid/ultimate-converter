import type { FileFormat } from '../types';

export class DataEngine {
    static async convert(file: File, targetFormat: FileFormat): Promise<Blob> {
        const ext = file.name.split('.').pop()?.toUpperCase() ?? '';

        // 1. Convert to Base64 (Any file -> B64 string)
        if (targetFormat === 'B64') {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64Data = result.includes(',') ? result.split(',')[1] : result;
                    resolve(new Blob([base64Data], { type: 'text/plain' }));
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const text = await file.text();

        // 2. Decode Base64 (B64 string -> generic text/binary buffer if we could, but let's assume text output for now)
        if (ext === 'B64' || ext === 'TXT') {
            try {
                if (targetFormat === 'JSON' || targetFormat === 'CSV' || targetFormat === 'XML') {
                    // Assume the text is actually just base64 encoded string of that target
                    const decoded = atob(text.trim());
                    // Not a robust assumption without knowing what was encoded, but we'll try to parse it if we need to.
                    // For standard JSON/CSV/XML conversions from actual JSON/CSV/XML:
                }
            } catch (e) {
                // Ignore base64 decode errors
            }
        }

        try {
            // Conversions to JSON
            if (targetFormat === 'JSON') {
                if (ext === 'CSV') return new Blob([JSON.stringify(this.csvToJson(text), null, 2)], { type: 'application/json;charset=utf-8' });
                if (ext === 'XML') throw new Error("XML to JSON not implemented natively yet");
                throw new Error(`Cannot convert ${ext} to JSON directly. Use a CSV file.`);
            }

            // Conversions to CSV
            if (targetFormat === 'CSV') {
                if (ext === 'JSON') {
                    // Add BOM for Excel compatibility natively
                    const csvContent = '\uFEFF' + this.jsonToCsv(text);
                    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
                }
                throw new Error(`Cannot convert ${ext} to CSV directly. Use a JSON file.`);
            }

            // Conversions to XML
            if (targetFormat === 'XML') {
                if (ext === 'JSON') return new Blob([this.jsonToXml(text)], { type: 'application/xml;charset=utf-8' });
                throw new Error(`Cannot convert ${ext} to XML directly. Use a JSON file.`);
            }

            throw new Error(`Unsupported generic conversion to ${targetFormat}.`);
        } catch (error) {
            throw new Error(`Data conversion failed: ${error instanceof Error ? error.message : 'Invalid structure'}`);
        }
    }

    private static csvToJson(csv: string): any[] {
        const lines = csv.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const obj: any = {};
            const currentLine = lines[i].split(',');
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
            }
            result.push(obj);
        }
        return result;
    }

    private static jsonToCsv(jsonStr: string): string {
        const arr = JSON.parse(jsonStr);
        if (!Array.isArray(arr) || arr.length === 0) throw new Error("JSON must be an array of objects to convert to CSV");

        const headers = Object.keys(arr[0]);
        const csvRows = [headers.join(',')];

        for (const row of arr) {
            const values = headers.map(header => {
                const val = row[header] ?? '';
                // Escape commas with quotes
                const strVal = String(val);
                return strVal.includes(',') ? `"${strVal}"` : strVal;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    private static jsonToXml(jsonStr: string): string {
        const obj = JSON.parse(jsonStr);
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

        const parseNode = (data: any, indent: string): string => {
            let localXml = '';
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    data[key].forEach((item: any) => {
                        localXml += `${indent}<${key}>\n${parseNode(item, indent + '  ')}${indent}</${key}>\n`;
                    });
                } else if (typeof data[key] === 'object' && data[key] !== null) {
                    localXml += `${indent}<${key}>\n${parseNode(data[key], indent + '  ')}${indent}</${key}>\n`;
                } else {
                    localXml += `${indent}<${key}>${data[key]}</${key}>\n`;
                }
            }
            return localXml;
        };

        if (Array.isArray(obj)) {
            obj.forEach(item => {
                xml += parseNode({ item }, '  ');
            });
        } else {
            xml += parseNode(obj, '  ');
        }

        xml += '</root>';
        return xml;
    }
}
