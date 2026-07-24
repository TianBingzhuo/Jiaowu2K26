import IntlMessageFormat, {
  type PrimitiveType,
} from "intl-messageformat";
import type { AppLocale } from "./catalog";

export type MessageValues = Record<
  string,
  PrimitiveType | Date | ((chunks: string[]) => string)
>;

const messageCache = new Map<string, IntlMessageFormat>();

export function formatIcuMessage(
  pattern: string,
  locale: AppLocale | string,
  values: MessageValues = {},
): string {
  const cacheKey = `${locale}\u0000${pattern}`;
  let formatter = messageCache.get(cacheKey);

  if (!formatter) {
    formatter = new IntlMessageFormat(pattern, locale);
    messageCache.set(cacheKey, formatter);
  }

  const result = formatter.format(values);
  return Array.isArray(result) ? result.join("") : String(result);
}

export function clearMessageFormatCacheForTests(): void {
  messageCache.clear();
}
