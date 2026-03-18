# Architecture — flext2pdf

[< README.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/README.md)

![trustme24_flext_cover.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_logo_cover.jpg)

This document explains how **flext2pdf** is built internally.

Its purpose is simple: if you open the repository and want to make a change, this file should help you quickly answer two questions:

* Where should this change be made
* Why is the code organized this way

> 💡 **This is not a user guide.** It is an architecture guide for contributors and maintainers.

---

## 1. flext2pdf at the Architecture Level

**flext2pdf** is a small PDF adapter for the Flext ecosystem.

It does not parse the Flext language itself. It does not build a document model. It does not manage workflows, queues, or templates as a product layer.

#### Its job is much narrower:

* Accept a template string or a ready `Flext` instance
* Ask Flext for rendered HTML and CSS
* Place that output into a minimal HTML document shell
* Load the document into Playwright / Chromium
* Return a PDF `Buffer`

That is the main architectural rule of the repository:

> 💡 **flext2pdf is a rendering bridge**, not a second template engine.

General ecosystem ideas from Flext still matter here: templates stay the source of truth, runtime behavior should stay explicit, and the package should remain easy to read in one pass.

---

## 2. Main Flow

**flext2pdf** works as a short pipeline.

```text
Template String / Flext Instance
  v
Flext HTML / CSS Rendering
  v
Minimal HTML Document
  v
Playwright Page.setContent(...)
  v
Chromium Page.pdf(...)
  v
PDF Export
```

This flow is the fastest way to understand the repository.

#### A few practical examples:

* If the change affects HTML wrapping, title, lang, CSS injection, or meta tags, the change belongs to the HTML shell layer
* If the change affects margins, page format, or background printing, the change belongs to the PDF generation layer
* If the change affects browser reuse, page creation, or cleanup, the change belongs to the factory and lifecycle layer
* If the change affects template syntax, directives, AST, or model behavior, the change probably belongs in **Flext**, not in this repository

---

## 3. Repository Structure

The repository is intentionally small.

* `src/` contains the source code of the library
* `dist/` contains generated build artifacts published to consumers
* `bin/` contains CLI and build/runtime helper scripts

#### If you are new to the codebase, the usual reading order is:

1. **Readme:** [Go to README.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/README.md)
2. **Package:** [Go to package.json](package.json)
3. **Types:** [Go to src/types.ts](src/types.ts)
4. **Main Code:** [Go to src/index.ts](src/index.ts)
5. **Helpers:** [Go to src/lib.ts](src/lib.ts)
6. **Build Output:** inspect `dist/` only to confirm published API shape

> ⚠️ **Source of truth** is always `src/`. Do not edit `dist/` manually.

---

## 4. Main Architectural Layers

flext2pdf is easier to understand if you think in four small layers.

### 4.1 Factory Layer

This layer is centered around `flext2pdf(...)` in `src/index.ts`.

#### It creates or accepts a Playwright `browser`, then returns a converter object with these handlers:

* `pdf(...)`
* `flextToPdf(...)`
* `hbsToPdf(...)`
* `clear()`

This layer owns the long-lived runtime object of the package: the browser instance.

### 4.2 Flext Rendering Layer

This layer converts a `Flext` instance into printable HTML.

Main entry points:

* `flextToFilteredHtml(...)`
* `flextToPdfBuffer(...)`

What it does:

* Calls `val.getHtml(...)`
* Calls `val.getCss(...)`
* Passes both outputs into the HTML shell helper

What it does not do:

* Parse directives manually
* Inspect AST directly
* Mutate Flext internals
* Re-implement template semantics

### 4.3 HTML Shell Layer

This layer lives in `src/lib.ts` and `src/base.html.tpl`.

Its role is deliberately small:

* Wrap body HTML into a valid document
* Inject CSS into `<style>`
* Set `lang`
* Set `<title>`
* Pass through optional `meta`

> 💡 **This layer should stay transparent.** It is allowed to normalize the outer document shell, but it should not rewrite rendered body content unless there is a very strong reason.

### 4.4 PDF Output Layer

This layer also lives in `src/lib.ts`.

Main entry point:

* `htmlToPdfBuffer(...)`

It takes ready HTML and a Playwright `page`, then:

* Loads the HTML through `page.setContent(...)`
* Generates the PDF through `page.pdf(...)`
* Returns the result as `Buffer`

The option surface is intentionally small and explicit:

* `format`
* `margins`
* `background`

If more options are added in the future, they should be wired one by one and documented clearly.

---

## 5. Runtime Ownership Model

This is the most important part of the package.

### 5.1 Browser Ownership

`flext2pdf(...)` can:

* Create its own browser through `chromium.launch()`, or
* Reuse a browser passed in through `options.browser`

In both cases the returned converter keeps a reference to that browser.

Today `clear()` closes the held browser instance. That behavior is simple, but it also means lifecycle changes here are high-impact and must be reviewed carefully.

### 5.2 Page Ownership

Each render call can:

* Reuse an external `page`, or
* Create a page internally through `browser.newPage()`

This ownership rule must stay obvious:

* If the page came from the caller, the library must not behave as if it owns that page
* If the page was created internally, the library is responsible for closing it

### 5.3 Why this matters

Most real bugs in this package will not come from PDF formatting. They will come from lifecycle mistakes:

* Leaked pages
* Closed shared resources
* Hidden ownership rules
* Inconsistent cleanup on error paths

> ⚠️ **When changing this area**, read the whole flow from `flext2pdf(...)` to `page.close()` before editing anything.

---

## 6. Main Functions and Their Roles

The runtime is built from a few small functions. Each one should keep one clear responsibility.

### 6.1 `flext2pdf(...)`

This is the package factory.

Responsibilities:

* Create or accept the browser
* Define converter handlers
* Expose `clear()`

It should not become a framework, service container, or policy layer.

### 6.2 `hbsToPdf(...)`

This is the string-template path.

Responsibilities:

* Create a `Flext` instance
* Call `setTemplate(...)`
* Optionally inject data
* Forward to the common PDF flow

> 💡 **This function is the bridge** from raw template string to the regular render pipeline.

### 6.3 `flextToPdf(...)`

This is the main public handler behind `pdf(...)`.

Responsibilities:

* Dispatch by input type
* Forward strings to `hbsToPdf(...)`
* Forward `Flext` instances to `flextToPdfBuffer(...)`
* Handle page reuse / page creation

### 6.4 `flextToFilteredHtml(...)`

This function asks Flext for:

* HTML
* CSS

Then it creates the final printable document string through `htmlToFiltered(...)`.

This is the clean boundary between Flext rendering and browser rendering.

### 6.5 `htmlToFiltered(...)`

This helper applies a very small template over the rendered output.

It is intentionally plain string replacement over placeholders such as:

* `{LANG}`
* `{TITLE}`
* `{CSS}`
* `{META}`
* `{BODY}`

> 💡 **That simplicity is a feature.** Keep it easy to read.

### 6.6 `htmlToPdfBuffer(...)`

This is the final browser-facing helper.

Responsibilities:

* Set page content
* Pass PDF options explicitly
* Return the PDF buffer

It should remain a thin wrapper over Playwright, not an abstraction maze.

---

## 7. HTML Shell Contract

The HTML shell is minimal on purpose.

Current shell structure:

```html
<!DOCTYPE html>
<html lang="{LANG}">
<head>
  <meta charset="UTF-8">
  <title>{TITLE}</title>
  <style>{CSS}</style>
  {META}
</head>
<body>
  {BODY}
</body>
</html>
```

This contract is useful because it keeps PDF rendering predictable and easy to debug.

### Rules for this layer

* Keep the shell small
* Keep placeholder names obvious
* Do not add browser-side hacks casually
* Do not move document business semantics into the shell
* If shell behavior changes, update docs and examples

---

## 8. Playwright Boundary

**flext2pdf** is a thin wrapper over Playwright, not a replacement for it.

The important primitives are still the standard ones:

* `chromium.launch(...)`
* `browser.newPage()`
* `page.setContent(...)`
* `page.pdf(...)`
* `page.close()`
* `browser.close()`

The package adds three things on top:

* Integration with Flext
* A minimal HTML assembly step
* A small reusable API for PDF generation

> ⚠️ **That boundary should stay visible** in the code. Do not hide Playwright behind a large custom abstraction unless there is a very clear reason.

---

## 9. What Does Not Belong Here

This repository should stay narrow.

The following concerns belong somewhere else:

* Flext AST parsing
* Directive parsing such as `@v`, `@use`, `@field`, `@lang`
* Data Model generation
* Validation architecture
* Document workflow logic
* HTTP delivery layers
* Queue workers and retry orchestration
* Business rules around contracts, invoices, approvals, or statuses

If a planned feature starts pulling the package toward those concerns, stop and check whether the change belongs in Flext or in the outer application instead.

---

## 10. Reliability Rules

Even though the package is small, runtime mistakes are expensive.

### 10.1 Treat cleanup as architecture

Cleanup is not a minor detail. It is part of the design.

Any change touching:

* `browser.newPage()`
* `page.close()`
* `browser.close()`
* Error paths around PDF rendering

...should be treated as an architectural change, not as a small refactor.

### 10.2 Prefer Explicit Behavior

Good changes in this repository usually have these properties:

* Small diff
* Clear ownership
* Little hidden state
* Direct mapping from option to behavior
* Easy debugging when rendering fails

### 10.3 Avoid scope creep

**flext2pdf** should remain easy to explain in one sentence:

> "Render Flext output through headless Chromium and return a PDF buffer."

If a change makes that sentence harder to defend, the design is probably drifting.

---

## 11. Public API Contract

The public surface is intentionally compact.

Main export:

* `flext2pdf`

Main runtime handlers:

* `pdf`
* `flextToPdf`
* `hbsToPdf`
* `clear`

Low-level helpers:

* `flextToFilteredHtml`
* `flextToPdfBuffer`
* `htmlToFiltered`
* `htmlToPdfBuffer`

Output contract:

* PDF output is returned as `Buffer`

When making changes:

* Do not widen the API casually
* Do not imply full Playwright passthrough unless it is truly supported
* Do not change ownership expectations silently
* Update docs when behavior changes

---

## 12. Development Notes

If you change the code, verify both behavior and published shape.

Recommended checks:

```shell
npm run build
```

Review both:

* Source logic in `src/`
* Generated typings/output in `dist/`

---

**flext2pdf by Kenny Romanov**  
TrustMe
