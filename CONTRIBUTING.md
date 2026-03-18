# Contributing — flext2pdf

[< README.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/README.md)

![trustme24_flext_cover.jpg](https://raw.githubusercontent.com/TrustMe-kz/flext2pdf/9908c181702d01f9559f56fbab242028500c3886/docs/trustme24_flext_logo_cover.jpg)

Thank you for contributing to **flext2pdf**.

This file explains the practical side of contribution: what kinds of changes are welcome, how to prepare a pull request, and what maintainers expect before review.

If you are new to the project, read [README.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/README.md) and [ARCHITECTURE.md](https://github.com/TrustMe-kz/flext2pdf/blob/main/ARCHITECTURE.md) first. This file assumes you already understand what flext2pdf is and how the codebase is organized.

---

## 1. What contributions are welcome

Useful contributions include bug fixes, documentation improvements, example templates, build verification improvements, performance improvements that preserve behavior, and small API or rendering improvements that keep the package focused.

Changes that affect rendering behavior, public API, browser/page lifecycle, or other stability-sensitive parts should be discussed in an issue before implementation.

---

## 2. What usually needs discussion first

Open an issue before starting if your change does any of the following:

* Changes public API behavior or signatures
* Changes browser or page ownership behavior
* Changes HTML shell behavior in a way that can affect rendering fidelity
* Expands the package beyond its role as a PDF rendering adapter
* Performs a large refactor across multiple parts of the system

This saves time for both contributors and maintainers.

---

## 3. What usually will not be accepted

The following kinds of changes are usually rejected:

* Breaking behavior changes without prior discussion
* Large formatting-only pull requests
* Architecture rewrites that were not requested
* Template-engine logic moved into flext2pdf
* Heavy new dependencies without strong justification
* Unrelated cleanup mixed into a functional PR

> 💡 **Keep changes focused** and easy to review.

---

## 4. Before you start

Before writing code, check existing issues and confirm that the problem has not already been discussed. For anything larger than a small fix, open an issue first and confirm direction with maintainers.

Prefer the smallest useful change. In flext2pdf, small diffs are much easier to review and much less likely to introduce rendering or lifecycle regressions.

---

## 5. Development Setup

Clone the repository, install dependencies, and run the project locally.

```shell
npm install
npm run build
```

> ⚠️ **Do not edit** `dist/` manually. Source of truth is `src/`.

---

## 6. Contribution Workflow

The normal workflow is simple:

1. Fork the repository
2. Create a branch for your change
3. Implement the change in the smallest relevant area
4. Add or update verification if needed
5. Run the build
6. Open a pull request with a clear description

A good pull request explains three things clearly: what problem it solves, what changed, and whether any user-visible behavior changed.

---

## 7. Pull Request Expectations

Each pull request should solve one clear problem. Keep the diff small, avoid unrelated refactoring, and match the existing code style.

If behavior changes, add or update verification where the repository supports it. If examples or public behavior change, update documentation too. README examples and public API examples are part of the project contract and should stay accurate.

Before opening a PR, review your own diff and remove accidental formatting changes or unrelated edits.

---

## 8. Tests & Verification

Behavior changes should be verified before submission. This is especially important for browser lifecycle, PDF option handling, HTML shell behavior, and public API output.

At minimum, run the full build before submitting:

```shell
npm run build
```

> ⚠️ **Do not claim verification** that the repository does not currently provide. If you validate behavior manually, describe that clearly in the PR.

---

## 9. Modules, Templates, & Docs

When possible, keep new behavior at the adapter boundary instead of pushing template-engine responsibilities into flext2pdf.

Template-related examples should keep templates declarative and predictable. Documentation contributions are welcome, especially when they improve clarity, examples, or explain real usage patterns better.

---

## 10. Review & Communication

Maintainers review pull requests when time allows. Some PRs may need revisions before merge. Not every contribution will be accepted, especially if it conflicts with the long-term direction or stability of the project.

Keep communication technical, clear, and respectful. If a change is discussed in an issue first, the review process is usually faster.

---

## 11. Practical Checklist

Before opening a pull request, make sure that:

* The change solves one clear problem
* The diff is limited to relevant files
* Verification was added or updated if needed
* `npm run build` passes
* Docs/examples were updated if behavior changed
* The PR description explains the reason for the change

🎉 **Thanks for helping improve flext2pdf.**

---

**flext2pdf by Kenny Romanov**  
TrustMe
