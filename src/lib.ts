import { Page } from 'playwright-core';
import baseHtml from './base.html.tpl';


// Constants

export const DEFAULT_FORMAT = 'A4';


// Functions

export function htmlToFiltered(val: string, options: any = {}): string {

    // Getting the options

    const lang = options?.lang ?? 'en';
    const title = options?.title ?? 'Unknown';
    const css = options?.css ?? '';
    const meta = options?.meta ?? '';


    // Filtering the data

    let result: string = baseHtml;

    const filter = (name: string, val1: string|number): void => {
        const newName = name?.toUpperCase() ?? null;
        result = result.replace('{' + newName + '}', String(val1));
    }

    filter('lang', lang);
    filter('title', title);
    filter('css', css);
    filter('meta', meta);
    filter('body', val);


    return result;
}

export async function htmlToPdfBuffer(val: string, page: Page, options: any = {}): Promise<Buffer> {

    // Getting the options

    const format = options?.format ?? DEFAULT_FORMAT;
    const margins = options?.margins ?? {};
    const topMargin = margins?.top ?? 0;
    const leftMargin = margins?.left ?? 0;
    const rightMargin = margins?.right ?? 0;
    const bottomMargin = margins?.bottom ?? 0;
    const background = options?.background ?? true;


    // Setting the page content

    await page.setContent(val, {
        waitUntil: 'load',
    });


    return await page.pdf({
        format: format,
        margin: {
            top: topMargin,
            left: leftMargin,
            right: rightMargin,
            bottom: bottomMargin,
        },
        printBackground: Boolean(background),
    });
}
