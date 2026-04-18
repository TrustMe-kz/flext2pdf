import { Page } from 'playwright-core';
import { core } from '@trustme24/flext';
import he from 'he';
import flextScript from '@/flext.js.txt';
import pageTemplate from '@/page.tpl';
import baseHtml from '@/base.html.tpl';


// Constants

export const DEFAULT_PAGE_LANG = 'en';

export const DEFAULT_PAGE_TITLE = 'Unknown';

export const DEFAULT_FORMAT = 'A4';

export const DEFAULT_MARGINS = 0;


// Functions

export function page(val: string = '', options: any = {}): string {

    // Getting the options

    const lang = options?.lang ?? DEFAULT_PAGE_LANG;
    const title = options?.title ?? DEFAULT_PAGE_TITLE;
    const css = options?.css || '';
    const meta = options?.meta || '';


    // Filtering the data

    let result: string = String(baseHtml);

    const filter = (name: string, _val: string|number): void => {
        const newName = name?.toUpperCase() ?? null;
        result = result.replace('{' + newName + '}', String(_val));
    }

    filter('lang', lang);
    filter('title', title);
    filter('css', css);
    filter('meta', meta);
    filter('body', val);


    return result;
}

export function hbsToPdfBuffer(val: string, _page: Page, options: core.types.Obj = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {

        // Getting the options

        const data = options?.data ?? null;
        const html = options?.html || '';
        const format = options?.format ?? DEFAULT_FORMAT;
        const margins = options?.margins ?? {};
        const topMargin = margins?.top ?? DEFAULT_MARGINS;
        const leftMargin = margins?.left ?? DEFAULT_MARGINS;
        const rightMargin = margins?.right ?? DEFAULT_MARGINS;
        const bottomMargin = margins?.bottom ?? DEFAULT_MARGINS;
        const background = Boolean(options?.background ?? true);


        // Defining the functions

        const serve = async (route) => await route.fulfill({
            status: 200,
            contentType: 'text/javascript',
            body: flextScript,
        });

        const finish = async () => {
            const result = await _page.pdf({
                format: format,
                margin: {
                    top: topMargin,
                    left: leftMargin,
                    right: rightMargin,
                    bottom: bottomMargin,
                },
                printBackground: background,
            });

            resolve(result);
        };

        const preview = async () => {

            // Getting the HTML

            let result = page(String(pageTemplate));

            const filter = (_val: string, valRef: string|number): void => { result = result.replace(_val, String(valRef)); }

            filter('<!--TEMPLATE-->', he.encode(val));
            filter('{"DATA":""}', JSON.stringify(data));
            filter('<!--HTML-->', html);


            // Setting up the page

            await _page.route('http://flext2pdf/flext.js', serve);
            await _page.exposeFunction('__error', reject);
            await _page.exposeFunction('__finish', () => finish().catch(reject));
            await _page.setContent(result, { waitUntil: 'load' });
        }


        preview().catch(reject);
    });
}
