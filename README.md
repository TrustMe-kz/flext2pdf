# flext2pdf

[![Static Badge](https://img.shields.io/badge/GitHub-Star%20%281%29-yellow?logo=github)](https://github.com/TrustMe-kz/flext2pdf)
[![Static Badge](https://img.shields.io/badge/NPM-Download%20%281765%29-blue)](https://www.npmjs.com/package/flext2pdf)

![trustme24_flext_cover.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_logo_cover.jpg)

**flext2pdf** is a PDF rendering layer for the Flext ecosystem.

In many systems, document generation does not stop at HTML preview. A template still needs to become a stable file that can be downloaded, stored, or delivered to another system. This step often becomes fragile: rendering differs across environments, PDF logic gets duplicated outside the template layer, browser setup becomes infrastructure-heavy, and preview no longer matches final output. flext2pdf addresses this problem by rendering Flext templates into PDFs through a predictable headless Chromium pipeline.

flext2pdf works on top of [Flext](https://www.npmjs.com/package/@trustme24/flext) and is designed as a focused output tool inside a larger document workflow. It keeps the template as the source of truth while exposing a small API for PDF generation, browser reuse, and print-oriented options.

* [GitHub: TrustMe-kz/flext2pdf](https://github.com/TrustMe-kz/flext2pdf)
* [NPM: flext2pdf](https://www.npmjs.com/package/flext2pdf)
* [Documentation: Available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/MTUwYzM5NjUzNDE4NDViMGJlMTliOWEzNzM1Y2RiZWE)

---

## Installation

```shell
npm i flext2pdf @trustme24/flext
npx flext2pdf install chromium
```

> ⚠️ **Make sure** your system provides `glibc` ≥ `2.28`.

🎉 **That's It!**

---

## The Problem

PDF generation often looks simple at first. Over time it tends to accumulate hidden complexity.

Typical issues include: duplicated rendering logic outside the template, inconsistent output across environments, fragile browser setup, weak control over print layout, and unnecessary divergence between preview and final PDF.

![trustme24_flext_abstract_painting.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_abstract_painting.jpg)

### A few common scenarios illustrate the problem:

1. **A system renders HTML for preview but uses a separate path for PDF generation. The result is inconsistent output and harder maintenance.**
   Solution with flext2pdf: The same Flext template can remain the source of truth for both preview and final PDF rendering.

————————————

2. **A service generates many PDFs but launches a fresh browser instance for every request. The result is avoidable overhead and poor throughput.**
   Solution with flext2pdf: The converter can reuse an existing Playwright browser or page and fit into long-lived service workflows.

————————————

3. **A document requires print-oriented control such as margins, format, or background rendering.**
   Solution with flext2pdf: PDF options can be forwarded to the underlying browser rendering pipeline.

---

## What It Provides

**flext2pdf** builds on top of [Playwright](https://playwright.dev/) and uses headless Chromium to turn Flext templates into PDF files. The goal is not to replace Flext or to serve as a universal PDF engine, but to provide a reliable final rendering step inside document generation workflows.

Instead of introducing a separate PDF-specific template layer, flext2pdf keeps the original Flext template in control. The template is rendered through Chromium, then exported through a small API that supports repeated use, session reuse, and print-related options.

This approach helps systems keep document rendering predictable while remaining easy to integrate into scripts, services, CI pipelines, and backend applications.

### Quick Start:

```ts
import flext2pdf from 'flext2pdf';

const template = `
  {{!-- @syntax "1.0" --}}
  {{!-- @use "put" --}}
  <div>{{ put data.helloWorld "No hello world..." }}</div>
`;

const data = { helloWorld: 'Hello World!' };

const converter = await flext2pdf();
const pdf = await converter.pdf(template, { data });
await converter.clear();
```

---

## Use Cases

![trustme24_flext_use_cases.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_use_cases.jpg)

**flext2pdf** is intended for structured document export inside the Flext ecosystem. Common examples include contracts, invoices, reports, certificates, internal document workflows, backend PDF generation, batch rendering, and document microservices.

flext2pdf can be used on its own, but it is also designed to serve as the PDF layer inside a larger system. Related tools include [Flext](https://www.npmjs.com/package/@trustme24/flext) as the core template engine and [vue-flext](https://www.npmjs.com/package/vue-flext) for browser-based preview and interaction.

Together these components allow Flext to power full document pipelines while flext2pdf remains a focused rendering tool for final PDF output.

---

## Working with PDFs

**flext2pdf** is intentionally small. A typical workflow consists of three steps: create or reuse a converter, render a PDF from a Flext template, and clear browser resources when finished.

### Example:

```ts
import flext2pdf from 'flext2pdf';

const converter = await flext2pdf();

const pdf = await converter.pdf(template, {
  data,
  format: 'A4',
  margins: {
    top: '20px',
    right: '20px',
    bottom: '20px',
    left: '20px',
  },
  background: true,
});

await converter.clear();
```

### Best Practices

Treat templates as the source of truth. Reuse browser sessions when generating multiple documents. Keep project-specific wrappers thin and pass print-related options explicitly. Pre-install Chromium in CI or Docker to avoid downloads at runtime.

### Limitations

**flext2pdf** is intentionally focused. It is not a universal PDF engine, not a visual editor, and not a complete document management system. Its role is to act as a reliable PDF rendering layer inside Flext-based document generation workflows.

---

## API

The main entry point is the `flext2pdf` factory.

### Basic usage:

```ts
import flext2pdf from 'flext2pdf';

const converter = await flext2pdf();
await converter.pdf('...');
await converter.clear();
```

The factory can also accept an existing Playwright `browser` or `page` for reuse in long-lived services and batch jobs.

[More information about the API is available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/MTUwYzM5NjUzNDE4NDViMGJlMTliOWEzNzM1Y2RiZWE).

---

## Architecture

**flext2pdf** operates as a simple pipeline.

```text
Template
  v
Flext Rendering
  v
Headless Chromium / Playwright
  v
PDF Output
```

At runtime flext2pdf renders a Flext template, opens or reuses a headless browser context, applies print-oriented options, and returns a PDF artifact. The result can then be stored, delivered to another service, or exposed as a downloadable file.

* [Repo: More information about the repo can be found in GitHub](https://github.com/TrustMe-kz/flext2pdf)
* [Documentation: More information about the API is available at TrustMe Wiki](https://trustmekz.atlassian.net/wiki/external/MTUwYzM5NjUzNDE4NDViMGJlMTliOWEzNzM1Y2RiZWE)

---

## Development

```shell
npm run lint
```

[More information about the contribution can be found in CONTRIBUTING.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/CONTRIBUTING.md).

---

## Roadmap

Future development focuses on improving reliability and adoption. Planned areas include stronger production guidance, better rendering controls, clearer browser lifecycle patterns, richer documentation, ecosystem integrations, performance optimizations, and more example-driven usage for services and CI pipelines.

![trustme24_flext_abstract_painting.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_abstract_painting.jpg)

* **Contributions** are welcome. Useful areas include documentation, examples, rendering improvements, browser reuse patterns, performance optimizations, and test coverage. Changes that affect the rendering contract or core behavior should first be discussed in issues so architectural decisions remain consistent.

————————————

* **Governance:** flext2pdf is maintained by [TrustMe](https://trustme24.com/). External contributions are encouraged while core design decisions remain centralized to keep the ecosystem coherent.

————————————

* **Security:** If you discover a security issue, please report it privately to [i.am@kennyromanov.com](mailto:i.am@kennyromanov.com) instead of opening a public issue.

————————————

* **License:** flext2pdf is released under the [MIT License](https://github.com/TrustMe-kz/flext2pdf/blob/main/LICENSE)

---

**flext2pdf by Kenny Romanov**  
TrustMe
