import fs from "node:fs";
import type { AstroIntegration } from "astro";
import OpenAI from "openai";
import { z } from "zod";
import { getDirectoryTokens } from "./utils/internals";
import { LocaleSchema, type Locale, type Locales } from "./types";

const openai = new OpenAI({ apiKey: z.string().parse(process.env.OPENAI_KEY) });

interface I18nIntegration {
  defaultLocale: Locale["code"];
  locales: { code: Locale["code"]; name: Locale["name"] }[];
  generate?: boolean;
  debug?: boolean;
}

const i18n = ({
  defaultLocale,
  locales,
  generate = false,
  debug = false,
}: I18nIntegration): AstroIntegration => {
  const consoleLog: typeof console.log = (...args) =>
    debug && console.log("[i18n]", ...args);

  return {
    name: "astro-i18n-pages",
    hooks: {
      "astro:config:setup": async ({ config, injectRoute }) => {
        consoleLog("Initializing...");
        // consoleLog('srcDir', config.srcDir)
        // consoleLog('trailingSlash', config.trailingSlash)

        if (!fs.existsSync("./public")) {
          fs.mkdirSync("./public");
        }
        if (!fs.existsSync("./public/locales")) {
          fs.mkdirSync("./public/locales");
        }

        if (!generate) return;

        consoleLog("Extracting paths/texs...");
        const { paths, texts } = getDirectoryTokens("./src");

        const generatedLocales = locales.map((locale) => ({
          ...locale,
          paths: Object.fromEntries([...paths].map((path) => [path, path])),
          texts: Object.fromEntries([...texts].map((text) => [text, text])),
        }));

        consoleLog("Translating paths/texts...");
        const translatedLocales: Locales = [];
        for (const generatedLocale of generatedLocales) {
          let parsedLocale: Locale | null = null;

          if (generatedLocale.code !== defaultLocale) {
            const result = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: [
                    "You are an I18n tool that translates a user input.",
                    'Here is an example : { "code": "fr", name: "Français", "paths": { "dashboard": "dashboard" }, "texts": { "All accounts": "All accounts", "Add website": "Add website" } }.',
                    "Translate from english to the locale specified in the input.",
                    "Only translate the right hands of the paths and texts objects.",
                    '"paths" are slugs to will be used as pages slugs keep it url valid.',
                    "For the output, make sure to always respect the schema be valid json.",
                  ].join(" "),
                },
                {
                  role: "user",
                  content: JSON.stringify(generatedLocale, null, 2),
                },
              ],
            });

            const translatedLocale = result.choices[0].message.content ?? "";

            try {
              parsedLocale = LocaleSchema.parse(JSON.parse(translatedLocale));
            } catch (error) {
              console.error(error);
            }
          }

          translatedLocales.push(parsedLocale ?? generatedLocale);
        }

        consoleLog("Saving translations...");
        translatedLocales.forEach((locale) => {
          fs.writeFileSync(
            `./public/locales/${locale.code}.json`,
            JSON.stringify(locale, null, 2)
          );
        });
      },
    },
  };
};

export default i18n;
