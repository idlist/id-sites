# id-sites

There is a guy who really likes reworking on his personal site ~~where nobody really visit~~.

Personal homepage + blog in one bundle.

## Tech Stack

- Astro: Base multi-page backbone
- Vue: Homepage SPA and other dynamic elements
- Biome: Linter
- dprint: Formatter (Biome's formatting strategies on objects and arrays are horrible)

## Structure

Under `src/pages`:

- `index.astro`: Entry point for the homepage, a Vue SPA is inside it.
- `notes.astro` & `notes/`: MPA setup for the blog.

## `virtual-i18n`

A custom i18n solution for Vue parts of this site. This is a Vite plugin that uses the same ideology of [Paraglide JS](https://paraglidejs.com/) but inside the virtual module.

- The same: Still codegen.
- The pros: Fully customizable logic in my flavor. No more boilerplates.
- The cons: Bind to Vue + Vite. Not really tested.

Astro pages use another i18n solution (under `src/layout/i18n`) that is more familiar to common ones while reusing the tokenizer of the Vite plugin. The site is designed to be as static as possible on Astro side, and static rendering doesn't really need to be that optimized.

## License

Copyright (c) 2026 i'DLisT. All Rights Reserved.

- Articles under `src/notes` specifies their own licenses.
- This repository may not be used for AI training, which has been included in the "All Rights Reserved" statement. I'm pointing this out as my attitude.
