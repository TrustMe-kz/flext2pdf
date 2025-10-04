import { chromium, Browser, Page } from 'playwright-core';
import { Flext } from '@trustme24/flext';
import { Obj, PDF, Flext2Pdf, Flext2PdfHandler, FlextTemplate2PdfHandler, Flext2PdfClearHandler } from '@/types';
import { htmlToFiltered, htmlToPdfBuffer } from '@/lib';


// Functions

export async function flextToFilteredHtml(val: Flext, data?: Obj, helpers?: Obj): Promise<string> {
    const html = val.getHtml(data, helpers);
    const css = await val.getCss(data, helpers);

    return htmlToFiltered(html, { css });
}

export async function flextToPdfBuffer(val: Flext, page: Page, options: Obj = {}): Promise<Buffer> {
    const data = options?.data ?? null;
    const helpers = options?.helpers ?? null;
    const html = await flextToFilteredHtml(val, data, helpers);

    return htmlToPdfBuffer(html, page, options);
}

export async function flext2pdf(options: any = {}): Promise<Flext2Pdf> {
    const browser: Browser = options?.browser ?? await chromium.launch();


    // Defining the functions

    const hbsToPdf: FlextTemplate2PdfHandler = async (val: string, options: any = {}): Promise<PDF> => {
        const page: Page = options?.page ?? await browser.newPage();
        const data = options?.data ?? null;
        const isCustomPage = !!options?.page;


        // Getting the Flext

        const flext = new Flext().setTemplate(val);

        if (data) flext.setData(data);


        // Getting the PDF

        const result = await flextToPdfBuffer(flext, page, options);

        if (!isCustomPage) await page.close();


        return result;
    };

    const flextToPdf: Flext2PdfHandler = async (val: Flext | string, options: any = {}): Promise<PDF> => {

        // If the value is a string

        if (typeof val === 'string')
            return await hbsToPdf(val, options);


        // If the value is Flext

        const page: Page = options?.page ?? await browser.newPage();
        const result = await flextToPdfBuffer(val, page, options);
        const isCustomPage = !!options?.page;

        if (!isCustomPage) await page.close();


        return result;
    };

    const pdf = flextToPdf;

    const clear: Flext2PdfClearHandler = async (): Promise<void> => await browser.close();


    return { pdf, flextToPdf, hbsToPdf, clear };
}


export { htmlToFiltered };

export default flext2pdf;
