# flext2pdf

Instructions for AI agents working with the repository.

---

## 0) Quick facts about this repository

* Purpose: a focused PDF rendering layer for the **Flext ecosystem**
* Stack: `TypeScript`, `Playwright`, `Chromium`, `Flext`
* Core role:
    * `flext2pdf` — bridge from **Flext HTML/CSS** to **PDF output** through headless Chromium
* Core behaviors:
    * Accepts a template string or a ready `Flext` instance
    * Renders HTML and CSS through Flext
    * Wraps the result into a minimal HTML document shell
    * Loads the document into a Playwright page
    * Generates a PDF buffer through Chromium
* Structure overview:
    * `src/` — main source code (`index.ts`, low-level PDF / HTML helpers)
    * `bin/` — CLI/runtime helpers (for example Chromium install entrypoints)
    * `dist/` — compiled output
* Runtime model:
    * One converter holds one `browser`
    * Each `pdf()` call creates or reuses a `page`
    * Output is a `Buffer`
* Build / usage expectations:
    * Intended for server-side / CI / Docker environments
    * Chromium is installed separately
    * System dependencies and fonts are external runtime concerns

> Agents: before making changes, read `README.md`, `package.json`, public docs, and the generated `dist` typings/output.

---

## 1) Agent protocol

1. **Understand the task:**

    * Create a concise plan (3–7 steps) and follow it
2. **Minimal diff:**

    * Modify only the files and sections required for the task.  
      ❌ No mass refactoring or formatting changes across unrelated code.
3. **Maintain API stability:**

    * Preserve the public behavior of `flext2pdf()`, `pdf()`, helper exports, and ownership rules around `browser` / `page` unless a breaking change is explicitly required and approved
4. **Respect the layer boundary:**

    * `flext2pdf` is a rendering adapter, not a template engine, workflow engine, or document platform
5. **Runtime safety matters:**

    * Any change touching Playwright lifecycle, cleanup, or error handling must be treated as high-impact
6. **Tests and build:**
    * Run the relevant build / test / lint commands before committing
7. **Documentation:**

    * When functionality, lifecycle, or supported options change, update related comments, docs, and examples

---

## 2) Architecture and code placement

### 2.1. Rendering boundary and low-level helpers

Responsible for:

* Converting Flext output into a printable HTML document
* Injecting generated CSS into a minimal HTML shell
* Passing content into Playwright via `page.setContent(...)`
* Generating a PDF via `page.pdf(...)`
* Returning a `Buffer`

Requirements:

* Keep helpers **small, explicit, and predictable**
* Do not re-implement Flext parsing, directives, AST logic, or model handling here
* Do not move document/business semantics into the PDF layer
* Avoid hidden runtime behavior such as silent DOM rewriting, post-processing hacks, or browser-side mutations unless explicitly required

### 2.2. Factory and converter lifecycle

**flext2pdf factory:**

* Creates or accepts a Playwright `browser`
* Returns a converter object with methods such as `pdf(...)` and cleanup
* Holds browser ownership inside a closure when the browser was created internally

**Converter methods:**

* Accept either:
    * A template string, or
    * A ready `Flext` instance
* Create or reuse a `page`
* Render HTML/CSS
* Produce a PDF buffer
* Close only the resources they own

Requirements:

* **Ownership must stay explicit.** If a `page` is passed in from outside, the library must not assume ownership of it
* **Cleanup paths are critical.** Any page created internally must be cleaned up correctly, including error paths
* Do not weaken lifecycle behavior with “helpful” abstractions that hide who owns browser/page resources

### 2.3. HTML shell and normalization

`flext2pdf` is allowed to do a very small amount of normalization:

* Wrap HTML body content into a valid document
* Inject CSS into `<style>`
* Optionally pass through lightweight document metadata such as `lang`, `title`, or `meta` when the implementation supports it

Requirements:

* Do not rewrite rendered body HTML without a strong reason
* Do not introduce ad-hoc print hacks or style mutations casually
* Keep the shell layer minimal and transparent
* If shell behavior changes, document it clearly

### 2.4. Playwright interaction

The repository is a **thin wrapper** over Playwright, not a replacement for it.

Meaning:

* `chromium.launch(...)`, `browser.newPage()`, `page.setContent(...)`, `page.pdf(...)`, `page.close()` are expected primitives
* The main added value is:
    * Flext integration
    * Minimal HTML assembly
    * A small, reusable PDF API

Requirements:

* Do not build a large abstraction framework on top of Playwright unless explicitly required
* Do not promise support for Playwright PDF features that are not actually wired through the code
* If PDF options are expanded, keep the mapping explicit and documented

---

## 3) Code style

flext2pdf code should be **straightforward, explicit, and predictable**.

### 3.1. General principles

* One function — one responsibility
* Prefer **early returns** instead of deep nesting
* Function size target: **≤40–60 lines**
* Nesting depth: **≤3 levels**
* Prefer named helpers over long inline callbacks
* Runtime ownership should be obvious from reading the function once

### 3.2. Naming rules

* **Data --> nouns:**
  `browser`, `page`, `html`, `css`, `buffer`, `options`, `margin`
* **Actions --> verbs:**
  `flext2pdf`, `flextToPdfBuffer`, `flextToFilteredHtml`, `htmlToFiltered`, `htmlToPdfBuffer`, `clear`
* No unclear abbreviations
* No humorous names — this is infrastructure-adjacent rendering code

### 3.3. Function structure pattern

Preferred 4-step pattern:

1. **Doing some checks** — validate input / ownership assumptions
2. **Getting the data** — prepare browser/page/html/css/options
3. **Defining the functions** — local helpers if needed
4. **Main flow** — render / print / cleanup

Example:

```ts
export async function htmlToPdfBuffer(val: string, page: any, options: any = {}): Promise<Buffer> {

    // Doing some checks

    if (!page) throw new Error('PDF: Missing Playwright page');

    if (!val) throw new Error('PDF: Missing HTML content');


    // Getting the data

    const format = options?.format ?? DEFAULT_FORMAT;
    const margin = options?.margins ?? DEFAULT_MARGINS;
    const background = !!options?.background;


    // Defining the functions

    const getMargin = (name: string, fallback: string = '0px'): string => margin?.[name] ?? fallback;


    // Getting the PDF buffer

    await page.setContent(val, { waitUntil: 'load' });


    return await page.pdf({
        format: format,
        margin: {
            top: getMargin('top'),
            right: getMargin('right'),
            bottom: getMargin('bottom'),
            left: getMargin('left'),
        },
        printBackground: background,
    });
}
```

### 3.4. Breaking down “fat” functions

❌ **Bad** — one long function that launches the browser, parses templates, mutates HTML, applies PDF options, retries failures, restarts Chromium, and logs metrics.

✔️ **Good** — split responsibilities into readable steps:

```ts
export async function flextToPdfBuffer(val: Flext, page: any, options: any = {}): Promise<Buffer> {

    // Doing some checks

    if (!val) throw new Error('PDF: Missing Flext instance');


    // Getting the data

    const html = await flextToFilteredHtml(val, options);


    return await htmlToPdfBuffer(html, page, options);
}
```

### 3.5. Comments

Comments should explain **why**, not the syntax.

Use these markers consistently:

* `// Constants`
* `// Variables`
* `// Doing some checks`
* `// Getting the data`
* `// Defining the functions`
* `// TODO:` — planned improvement
* `// FIXME:` — known issue

Example:

```ts
/**
 * FIXME: kr: Internal pages must be closed even when rendering throws
 */
export async function renderWithOwnedPage(browser: any, html: string): Promise<Buffer> {

    // Getting the data

    const page = await browser.newPage();


    try { return await htmlToPdfBuffer(html, page); }
    finally { await page.close(); }
}
```

---

## 4) Runtime model & reliability

* The default model is simple: **one browser per converter, one page per render**
* `flext2pdf` itself is **not** a queue manager, retry engine, health-check system, or worker supervisor
* Long-lived production behavior is usually provided by the outer service

When modifying lifecycle-related code:

* Never blur resource ownership
* Prefer explicit cleanup over implicit magic
* Treat error-path cleanup as equally important as success-path cleanup
* Be careful with long-lived service risks:
    * Leaked pages
    * Crashed browser instances
    * Requests hanging without timeouts
    * Accidental shared state between renders

Important:

* The library may accept an external `browser` or `page`
* The library must not silently close externally owned resources
* If internal resources are created, cleanup should be robust and easy to reason about

---

## 5) PDF options and output contract

Public API must remain **clean and predictable**:

* `flext2pdf(...)`
* `pdf(...)`
* Low-level helpers such as HTML/PDF conversion helpers, when exported
* Output as `Buffer`

The current philosophy:

* Support a **small, explicit** PDF option surface
* Pass print-related options intentionally
* Do not imply “full Playwright passthrough” unless it is truly implemented

Requirements:

* If new PDF options are added, document them clearly
* If README/examples mention a capability, make sure the code actually supports it
* Avoid accidental API inflation through loosely forwarded option bags

Examples in docs are part of the public contract. If behavior changes --> update examples immediately.

Recommended minimal example:

```ts
import flext2pdf from 'flext2pdf';

const template = `
  {{!-- @syntax "1.0" --}}
  {{!-- @use "put" --}}
  <div>{{ put data.helloWorld "No hello world..." }}</div>
`;

const converter = await flext2pdf();
const pdf = await converter.pdf(template, {
  data: { helloWorld: 'Hello World!' },
  format: 'A4',
  margins: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  background: true,
});

await converter.clear();
```

---

## 6) Prohibitions & caution

* ❌ Don’t move Flext DSL semantics into this repository
* ❌ Don’t parse or manipulate AST directly here
* ❌ Don’t introduce business rules about documents, fields, statuses, approvals, or workflows
* ❌ Don’t turn the library into an HTTP server, queue worker, or orchestration layer
* ❌ Don’t add heavy abstractions over Playwright without justification
* ❌ Don’t silently mutate rendered body HTML with print hacks unless explicitly required and documented
* ❌ Don’t close externally owned `browser` / `page` resources
* ❌ Don’t broaden README claims beyond what the implementation actually supports
* ❌ Don’t hide lifecycle ownership behind clever helper layers

Be especially careful with:

* `try/finally` correctness around `page.close()`
* Browser reuse and crash behavior
* Long-lived memory/resource leaks
* Shell changes that affect HTML rendering fidelity
* “Small convenience features” that actually expand the library scope

---

## 7) Pre-commit checklist

* [ ] Task is completed according to the plan
* [ ] Public API has not been broken unintentionally
* [ ] Browser/page ownership still behaves correctly
* [ ] Error-path cleanup is handled safely
* [ ] No domain logic or Flext DSL semantics leaked into the PDF layer
* [ ] Code style follows the established pattern (checks --> data --> helpers --> main flow)
* [ ] Documentation/examples updated if behavior changed
* [ ] Relevant build / lint / test commands pass without errors
