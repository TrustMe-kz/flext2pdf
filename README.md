## flext2pdf

[![Static Badge](https://img.shields.io/badge/GitHub-Star%20%280%29-yellow?logo=github)](https://github.com/TrustMe-kz/flext2pdf)
[![Static Badge](https://img.shields.io/badge/NPM-Download%20%28364%29-blue)](https://www.npmjs.com/package/flext2pdf)


**flext2pdf** converts [Flext](https://www.npmjs.com/package/@trustme24/flext) templates into PDFs using [Playwright](https://playwright.dev/). It launches a headless Chromium instance to render your HTML and returns the resulting file through a tiny API. The library ships with ESM and CJS bundles.

Flext2PDF is maintained by [TrustMe](https://trustme24.com/).

### Here's a simple example:
```ts
import flext2pdf from 'flext2pdf';

const template = `
  {{!-- @v "1.0.beta3" --}}
  {{!-- @use "put" --}}
  <div>{{ put data.helloWorld "No hello world..." }}</div>
`;
const data = { helloWorld: 'Hello World!' };

const converter = await flext2pdf();
const pdf = await converter.pdf(template, { data });
await converter.clear();
```

## Installation

1. Install **dependencies**:

```shell
npm i flext2pdf @trustme24/flext
npx flext2pdf install chromium
```

2. Make sure your system provides **glibc \u2265 2.28**; Playwright's Chromium relies on it.

3. **You're all set!**

## Tips & Tricks

- Pass an existing `browser` or `page` to `flext2pdf()` to reuse Playwright sessions.
- Call `converter.clear()` to close the browser and free resources when finished.
- Pre-install Chromium in CI or Docker with `npx flext2pdf install chromium` to avoid downloads at runtime.
- Forward `format`, `background`, or other options to customize `page.pdf` output.

---
**flext2pdf by Kenny Romanov**  
TrustMe
