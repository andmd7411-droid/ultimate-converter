import { jsPDF } from 'jspdf';
import fs from 'fs';

async function testPdf() {
    const textPath = 'C:/Users/andre/OneDrive/Bureau/444 app multe/testEpubLog.txt';
    const content = fs.readFileSync(textPath, 'utf-8');

    const doc = new jsPDF();
    doc.setFontSize(11);

    const pagesRaw = content.split('---PAGE_BREAK---');
    let isFirstPage = true;

    console.log(`Split into ${pagesRaw.length} raw pages.`);

    for (let j = 0; j < pagesRaw.length; j++) {
        const trimmed = pagesRaw[j].trim();
        // Skip empty parts unless it's the only content
        if (!trimmed && pagesRaw.length > 1) continue;

        const splitText = doc.splitTextToSize(trimmed, 180);
        const linesPerPage = 45;

        if (splitText.length === 0) {
            if (!isFirstPage) doc.addPage();
            isFirstPage = false;
            // doc.text(..., 15, 20) ? No, just add page
            continue;
        }

        for (let i = 0; i < splitText.length; i += linesPerPage) {
            if (!isFirstPage) doc.addPage();
            isFirstPage = false;
            const pageText = splitText.slice(i, i + linesPerPage);
            doc.text(pageText, 15, 20);
        }
    }

    const arr = doc.output('arraybuffer');
    fs.writeFileSync('C:/Users/andre/OneDrive/Bureau/444 app multe/testOutput.pdf', Buffer.from(arr));
    console.log(`Generated PDF with ${doc.getNumberOfPages()} pages.`);
}

testPdf().catch(console.error);
