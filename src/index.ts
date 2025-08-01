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
    const page: Page = options?.page ?? await browser.newPage();


    // Defining the functions

    const fromFlextTemplate: FlextTemplate2PdfHandler = async (val: string, options: any = {}): Promise<PDF> => {
        const flext = new Flext().setTemplate(val);
        return await flextToPdfBuffer(flext, page, options);
    };

    const fromFlext: Flext2PdfHandler = async (val: Flext | string, options: any = {}): Promise<PDF> => {
        if (typeof val === 'string')
            return await fromFlextTemplate(val, options);
        else
            return await flextToPdfBuffer(val, page, options);
    };

    const get = fromFlext;

    const clear: Flext2PdfClearHandler = async (): Promise<void> => await browser.close();


    return { get, fromFlext, fromFlextTemplate, clear };
}


export { htmlToFiltered };

export default flext2pdf;
