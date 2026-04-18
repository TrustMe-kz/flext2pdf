import { chromium, Browser, Page } from 'playwright-core';
import { PDF, Flext2Pdf, Flext2PdfHandler, FlextTemplate2PdfHandler, Flext2PdfClearHandler } from '@/types';
import { hbsToPdfBuffer } from '@/lib';
import Flext, { core } from '@trustme24/flext';


// Functions

export async function flextToPdfBuffer(val: core.types.ProcessorInterface, _page: Page, options: core.types.Obj = {}): Promise<Buffer> {

    // Getting the template

    const template = await val?.assets?.__template?.text();
    const html = val?.html ?? null;


    // Getting the margins

    const marginsStr = (val as any)?.margins?.trim() ?? null;
    const [ topMarginStr, rightMarginStr, bottomMarginStr, leftMarginStr ] = marginsStr?.split(' ') ?? [];
    const marginsObj = options?.margins ?? {};
    const topMargin = marginsObj?.top ?? null;
    const rightMargin = marginsObj?.right ?? null;
    const bottomMargin = marginsObj?.bottom ?? null;
    const leftMargin = marginsObj?.left ?? null;

    const margins = {
        top: topMarginStr ?? topMargin,
        right: rightMarginStr ?? topMarginStr ?? rightMargin,
        bottom: bottomMarginStr ?? topMarginStr ?? bottomMargin,
        left: leftMarginStr ?? rightMarginStr ?? topMarginStr ?? leftMargin,
    };


    return await hbsToPdfBuffer(template, _page, { ...options, html, margins });
}

export async function flext2pdf(options: any = {}): Promise<Flext2Pdf> {
    const browser: Browser = options?.browser ?? await chromium.launch();


    // Defining the functions

    const hbsToPdf: FlextTemplate2PdfHandler = async (val: string, options: any = {}): Promise<PDF> => {
        const _page: Page = options?.page ?? await browser.newPage();
        const data = options?.data ?? null;
        const isPagePassed = !!options?.page;


        // Getting the Flext

        const flext = new Flext().setTemplate(val);

        if (data) flext.setData(data);


        // Getting the PDF

        let result: PDF | null = null;

        try { result = await flextToPdfBuffer(flext, _page, options); }
        catch (e: any) { throw e; }
        finally { if (!isPagePassed) await _page.close(); }


        // Doing some checks

        if (!isPagePassed) await _page.close();


        return result;
    };

    const flextToPdf: Flext2PdfHandler = async (val: core.types.ProcessorInterface | string, options: any = {}): Promise<PDF> => {

        // If the value is a string

        if (typeof val === 'string') return await hbsToPdf(val, options);


        // If the value is Flext

        const _page: Page = options?.page ?? await browser.newPage();
        const result = await flextToPdfBuffer(val, _page, options);
        const isPagePassed = !!options?.page;

        if (!isPagePassed) await _page.close();


        return result;
    };

    const pdf = flextToPdf;

    const clear: Flext2PdfClearHandler = async (): Promise<void> => await browser.close();


    return { pdf, flextToPdf, hbsToPdf, clear };
}


export { PDF, Flext2Pdf, Flext2PdfHandler, FlextTemplate2PdfHandler, Flext2PdfClearHandler, hbsToPdfBuffer };

export default flext2pdf;
