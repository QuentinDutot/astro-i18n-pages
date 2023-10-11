import fs from "node:fs";
import negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";
import { getDirectoryFiles, getPageTranslation } from "./internals";
import { LocaleSchema } from "../types";

export const getLocalesCodes = () =>
  getDirectoryFiles("./public/locales").map((file) =>
    file.replace(".json", "")
  );

export const matchLocale = (input: string) => {
  const headers: negotiator.Headers = { "accept-language": input };
  const languages = new negotiator({ headers }).languages();
  const matchedLocale = match(
    languages,
    getLocalesCodes(),
    getLocalesCodes()[0]
  );
  return matchedLocale;
};

export const getLocaleCodeFromUrl = (url: URL) => {
  const [localeCode] = url.pathname.split("/").filter(Boolean);
  const doesItExist = getLocalesCodes().includes(localeCode);
  return doesItExist ? localeCode : undefined;
};

export const getLocaleDataFromUrl = (url: URL) => {
  const [localeCode] = url.pathname.split("/").filter(Boolean);
  const matchedLocale = getLocaleDataFromCode(localeCode);
  return matchedLocale;
};

export const getLocaleDataFromCode = (localeCode: string) => {
  const rawData = fs.readFileSync(
    `./public/locales/${localeCode}.json`,
    "utf-8"
  );
  const jsonData = JSON.parse(rawData);
  const parseResult = LocaleSchema.parse(jsonData);
  return parseResult;
};

export const getPagesByLocaleCode = (localeCode: string) => {
  const matchedLocale = getLocaleDataFromCode(localeCode);
  return matchedLocale
    ? [
        `/${matchedLocale.code}/`,
        ...Object.values(matchedLocale.paths).map(
          (page) => `/${matchedLocale.code}/${page}/`
        ),
      ]
    : undefined;
};

export const getPageByLocaleCode = (localeCode: string, path: string) => {
  const translations = getLocaleDataFromCode(localeCode);
  return getPageTranslation(path, translations.paths);
};
