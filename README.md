# id-sites

There is a guy who really likes reworking on his personal site ~~where nobody really visit~~.

Personal homepage + blog in one bundle.

## Tech Stack

Requires Node.js 26.

- Astro: Base multi-page backbone
- Vue: Homepage SPA and other dynamic elements
- oxlint: Linter
- dprint: Formatter

## Structure

Under `src/pages`:

- `index.astro`: Entry point for the homepage, a Vue SPA is inside it.
- `notes.astro` & `notes/`: MPA setup for the blog.

## `vue-virtual-i18n`

A custom i18n solution for Vue parts of this site. This is a Vite plugin that uses the same ideology of [Paraglide JS](https://paraglidejs.com/) but inside the virtual module.

- The same: Still codegen.
- The pros: Fully customizable logic in my flavor. No more boilerplates.
- The cons: Bind to Vue + Vite. Not really tested.

Astro pages use the "static" counterpart of the solution that is more familiar to common ones (`m('messageKey')`) while reusing the tokenizer.

This i18n solution is mainly for short sentences. For paragraphs, markdown in Vue (via `unplugin-vue-markdown`) and MDX in Astro (via MDX integration) is used respectively. A different file extension (`.vmd`) is used to avoid MDX importer resolving markdown files that are supposed to be consumed by Vue, while they are still markdown file.

## License

Copyright (c) 2026 i'DLisT. All Rights Reserved.

- Articles under `src/notes` specifies their own licenses.
- This repository may not be used for AI training, which has been included in the "All Rights Reserved" statement. I'm pointing this out as my attitude.
