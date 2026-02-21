import JSZip from 'jszip';
import fs from 'fs';

async function createEpub() {
    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");

    const metaInf = zip.folder("META-INF");
    metaInf.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

    const oebps = zip.folder("OEBPS");

    for (let i = 1; i <= 3; i++) {
        let content = `<html><head><title>Chapter ${i}</title></head><body><h1>Chapter ${i}</h1>`;
        for (let j = 0; j < 50; j++) {
            content += `<p>This is paragraph ${j} of chapter ${i}. It is meant to be long enough to force pagination in the PDF output. We need a lot of text here to make sure doc.text() splits it correctly across multiple pages.</p>\n`;
        }
        content += `</body></html>`;
        oebps.file(`chapter${i}.xhtml`, content);
    }

    // add an xml file without a body to test fallback
    oebps.file('test.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<note><to>User</to><from>Test</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>`);

    const content = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync('c:/Users/andre/OneDrive/Bureau/444 app multe/book_test.epub', content);
    console.log("EPUB created.");
}

createEpub();
