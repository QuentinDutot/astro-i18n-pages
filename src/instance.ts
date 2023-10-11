import type { Locale } from "./types";

const instance: {
  locale: Locale | undefined;
  path(path: string): string;
  text(text: string, data?: Record<string, string | number>): string;
} = {
  locale: undefined as Locale | undefined,
  path(path: string) {
    if (!this.locale) return path;
    if (path === "/") return `/${this.locale.code}/`;
    const [firstPart, ...otherParts] = path.slice(1, -1).split("/");
    const firstSegment = this.locale.paths[firstPart] ?? firstPart;
    const localizedPath = [firstSegment, ...otherParts].join("/");
    return `/${this.locale.code}/${localizedPath}/`;
  },
  text(text: string, data: Record<string, string | number> = {}) {
    if (!this.locale) return text;
    let translation = this.locale.texts[text] ?? text;
    Object.entries(data).forEach(([key, value]) => {
      translation = translation.replace(`{{${key}}}`, value.toString());
    });
    return translation;
  },
};

export default instance;
