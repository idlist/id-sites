# id-sites

There is a guy who really likes reworking on his personal site ~~where nobody really visit~~.

Personal homepage + blog in one bundle.

## Tech Stack

- Astro: Base multi-page backbone
- Vue: Home page SPA and other dynamic elements
- Biome: Linter
- dprint: Formatter

## Structure

Under `./src/pages/`:

- `index.astro`: Entry point for the homepage, a Vue SPA is inside it.
- `notes/` MPA backbones for the blog.

## `virtual-i18n`

a Vite plugin that uses the same ideology of Paraglide JS but inside the virtual module.

- The same: Still codegen.
- The pros: Fully customizable logic in my flavor. No more boilerplates.
- The cons: Bind to Vue + Vite. Untested.

## License

Copyright (c) 2026 i'DLisT. All Rights Reserved.
