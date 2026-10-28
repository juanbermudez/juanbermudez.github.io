# Self-hosted fonts

Manrope sets body and interface copy; JetBrains Mono sets metadata and code. Newsreader is the default for the wordmark and titles, with real regular and italic faces, variable weight 200–800, and optical sizing. The heading picker can also choose Fraunces, Source Serif 4, Instrument Serif, Instrument Sans, Bricolage Grotesque, Space Grotesk, or Manrope. Inter and DM Sans files remain here but are no longer registered. Font roles, weight ranges, and fallbacks are registered in `lib/registries/fonts.ts`.

All five families use the SIL Open Font License 1.1. The adjacent `*-OFL.txt` files are copied from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl), with each family's copyright notice. Ship those licenses with distributions of these font files.

No font network request is required at build time or when opening the desktop application. CSS loads each face from this directory only when that family and style are used. Add new licensed fonts here and register their faces once in `lib/registries/fonts.ts`.

Newsreader comes from the [Google Fonts variable-font service](https://fonts.google.com/specimen/Newsreader). Its source and design notes are maintained by [Production Type](https://github.com/productiontype/Newsreader). The local files retain both weight and optical-size axes; the serif fallback is Georgia.

The heading candidates added October 8, 2026 are the Latin subsets from Fontsource 5.3.0 (`@fontsource-variable/*`, and `@fontsource/instrument-serif` for its single weight), downloaded from jsDelivr. Fraunces, Source Serif 4, and Bricolage Grotesque keep weight and optical-size axes; Instrument Sans and Space Grotesk keep weight; Instrument Serif has one weight, so headings use 400 with it. Each `*-OFL.txt` beside them is that package's license file.
