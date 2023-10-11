import fs from "node:fs";
import path from "node:path";

export const getDirectoryFiles = (dirPath: string) => {
  const entries = fs.readdirSync(dirPath);

  const files: string[] = [];

  for (const entry of entries) {
    const isDirectory = !path.extname(entry);

    if (isDirectory) {
      const nestedFiles = getDirectoryFiles(path.join(dirPath, entry));
      const cleanedFiles = nestedFiles.map(
        (nestedFile) => `${entry}/${nestedFile}`
      );
      files.push(...cleanedFiles);
    } else {
      files.push(entry);
    }
  }

  return files;
};

export const getDirectoryTokens = (dirPath: string) => {
  const textRegex = /i18n\.text\(\s*["']([^"']+?)["']/gs;
  const pathRegex = /i18n\.path\(\s*["']([^"']+)["']\)/gs;

  const paths = new Set<string>();
  const texts = new Set<string>();

  const srcFiles = getDirectoryFiles(dirPath);

  srcFiles.forEach((srcFile) => {
    const rawData = fs.readFileSync(`${dirPath}/${srcFile}`, "utf-8");

    for (const match of rawData.matchAll(pathRegex)) {
      const path = match[1].slice(1, -1);
      if (path) paths.add(path);
    }

    for (const match of rawData.matchAll(textRegex)) {
      const text = match[1];
      if (text) texts.add(text);
    }
  });

  return { paths, texts };
};

export const getPageTranslation = (path: string, translations: object) => {
  const [firstKey = "", ...otherKeys] = path.split("/");

  // if it's a nested path explore it recursively
  if (otherKeys.length > 0) {
    const firstTranslated = getPageTranslation(firstKey, translations);
    const otherTranslated = getPageTranslation(
      otherKeys.join("/"),
      translations[firstKey] ?? {}
    );
    return `${firstTranslated}/${otherTranslated}`;
  }

  let translated: string | object | undefined = translations[firstKey];

  if (typeof translated === "string") {
    return translated;
  }

  if (
    typeof translated === "object" &&
    "index" in translated &&
    typeof translated.index === "string"
  ) {
    return translated.index;
  }

  return path;
};
