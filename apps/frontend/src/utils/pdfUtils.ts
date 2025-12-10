
// Use the window.pdfjsLib injected via CDN in index.html
// This avoids strict dependency issues in this environment

export const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
            try {
                const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);

                // @ts-ignore
                const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;

                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // @ts-ignore
                    const pageText = textContent.items.map((item) => item.str).join(" ");
                    fullText += pageText + "\n";
                }

                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = () => {
            reject("Error reading file");
        };

        fileReader.readAsArrayBuffer(file);
    });
};
