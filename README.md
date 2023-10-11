# astro-i18n-pages [![npm](https://img.shields.io/npm/v/astro-i18n-pages.svg)](https://www.npmjs.com/package/astro-i18n-pages)

An astro integration to sync i18n pages.

## How to use

### Install the package

```
npm install astro-i18n-pages
```

### Add environment variable

Generate an OPENAI api key [here](https://platform.openai.com/) and add it to the dotenv file. 

```
OPENAI_KEY="..."
```

### Update astro.config.mjs

```tsx
import { defineConfig } from "astro/config";
import i18n from 'astro-i18n-pages/plugin';

export default defineConfig({
  integrations: [
    i18n({
      defaultLocale: 'en',
      locales: [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
      ],
    }),
  ],
});
```

### Translate paths and texts

Create the page src/routes/[locale]/index.astro.

```jsx
---
import i18n from "astro-i18n-pages/instance";
import { getLocaleDataFromUrl } from "astro-i18n-pages/utils";

i18n.locale = getLocaleDataFromUrl(Astro.url);
---

<a href={i18n.path("dashboard")}>{i18n.text("Dashboard")}</a>
```

### Translate client-side (optional)

Add the client snippet in <head> to support i18n with client:load and client:only directives.

```jsx
---
import { I18nClient } from "astro-i18n-pages/components";
---

<I18nClient url={Astro.url} />
```

## Reference

### Config options

| Property      | Type    | Default | Description                                |
| ------------- | ------- | ------- | ------------------------------------------ |
| defaultLocale | string  | -       | The locale used in i18n.text('...')        |
| locales       | array   | -       | List of locales with "code" and "name"     |
| generate      | boolean | false   | Whether to regenerate and translate or not |
| debug         | boolean | false   | Whether to display the console logs or not |
