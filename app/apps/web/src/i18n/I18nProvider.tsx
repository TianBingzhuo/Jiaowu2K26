import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  HUD_COPY,
  isAppLocale,
  type AppLocale,
} from "./catalog";
import {
  formatIcuMessage,
  type MessageValues,
} from "./messageFormat";

const LOCALE_STORAGE_KEY = "university2k26.locale.v1";

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatList: (values: string[], options?: Intl.ListFormatOptions) => string;
  formatMessage: (pattern: string, values?: MessageValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const detectInitialLocale = (): AppLocale => {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isAppLocale(stored)) return stored;
  } catch {
    // Storage can be denied in hardened browsers; language remains usable.
  }

  return window.navigator.language.toLowerCase().startsWith("zh")
    ? "zh-CN"
    : "en-US";
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(detectInitialLocale);

  const setLocale = (nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // The current session still changes language.
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
    document.documentElement.dataset.locale = locale;
    document.title =
      locale === "zh-CN"
        ? "大学2K26 · University2K26 V0.9"
        : "University2K26 · Your Degree, Your Career Mode";
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN"),
      formatDate: (input, options) =>
        new Intl.DateTimeFormat(locale, options).format(new Date(input)),
      formatNumber: (input, options) =>
        new Intl.NumberFormat(locale, options).format(input),
      formatList: (values, options) =>
        new Intl.ListFormat(locale, options).format(values),
      formatMessage: (pattern, values) =>
        formatIcuMessage(pattern, locale, values),
    }),
    [locale],
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
      <span className="sr-only" aria-live="polite">
        {HUD_COPY[locale].announce}
      </span>
    </I18nContext.Provider>
  );
}

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }
  return context;
};
