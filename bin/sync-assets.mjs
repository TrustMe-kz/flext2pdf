#!/usr/bin/env node

import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import http from 'http';
import https from 'https';


// Constants

const FLEXT_UNPKG_URL = 'https://unpkg.com/@trustme24/flext@latest/dist/index.js';

const MAX_REDIRECTS = 5;


// Variables

const flextPath = resolve(process.cwd(), 'src/flext.js.txt');


// Functions

function get(url, redirect = 0) {
    return new Promise((resolve, reject) => {

        // Doing some checks

        if (redirect >= MAX_REDIRECTS) {
            reject(`flext2pdf: Unable to sync the asset ('${url}'): Too many redirects: ${redirect}`);
            return;
        }


        // Getting the client

        const client = url.startsWith('https:') ? https : http;


        // Getting the data

        const request = client.get(url, response => {
            const status = response?.statusCode ?? 0;
            const location = response.headers?.location ?? null;


            // Doing some checks

            if (status >= 300 && status < 400 && location) {
                response.resume();

                const nextUrl = new URL(location, url).toString();

                resolve(get(nextUrl, redirect + 1));

                return;
            }

            if (status < 200 || status >= 300) {
                response.resume();

                reject(`flext2pdf: Unable to sync the asset ('${url}'): Request failed with status ${status}`);

                return;
            }


            // Getting the data

            let body = '';

            response.setEncoding('utf8');

            response.on('data', chunk => body += chunk);

            response.on('end', () => resolve(body));
        });


        request.on('error', reject);
    });
}

async function sync() {

    // Getting the data

    console.log(`flext2pdf: Syncing the assets...`);

    const data = await get(FLEXT_UNPKG_URL);


    // Doing some checks

    if (!data) throw new Error(`flext2pdf: Unable to sync the asset ('${FLEXT_UNPKG_URL}'): Bad response: '${content}'`);


    // Updating the file

    await writeFile(flextPath, data, 'utf8');

    console.log(`flext2pdf: Synced 1 asset to '${flextPath}' (${Buffer.byteLength(data, 'utf8')} bytes)`);
}


sync().catch(e => {
    console.error(`flext2pdf: Unable to sync the assets: ` + e?.message ?? 'Unknown Error');
    process.exitCode = 1;
});
