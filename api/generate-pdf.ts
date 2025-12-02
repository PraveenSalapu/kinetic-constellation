import puppeteer from 'puppeteer-core';

// This is a serverless function handler compatible with Vercel
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { resumeHtml } = req.body;

        if (!resumeHtml) {
            return res.status(400).json({ message: 'Missing resumeHtml' });
        }

        // In a real Vercel environment, you would use @sparticuz/chromium
        // For local development, we might need to point to a local Chrome executable
        // or use a different strategy.
        // This code assumes a standard Puppeteer setup for now.

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            // executablePath: await chromium.executablePath(), // Needed for Vercel
        });

        const page = await browser.newPage();

        // Set content and wait for network idle to ensure fonts/images load
        await page.setContent(resumeHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            },
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: String(error) });
    }
}
