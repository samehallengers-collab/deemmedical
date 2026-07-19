import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { translations, type Lang, type TKey } from "./translations";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "app_lang";
const CACHE_KEY = "app_translation_cache_v1";

// Shared translation cache & batching (module-scope)
type CacheMap = Record<string, string>; // key: `${lang}::${text}` -> translated
let cache: CacheMap = {};
try {
  const raw = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
  if (raw) cache = JSON.parse(raw);
} catch {}

const listeners = new Set<() => void>();
function notify() {
  for (const l of listeners) l();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

const pending: Map<Lang, Set<string>> = new Map();
const inflight: Map<Lang, Set<string>> = new Map();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function queueTranslation(text: string, lang: Lang) {
  if (!text || lang === "en") return;
  const key = `${lang}::${text}`;
  if (cache[key] !== undefined) return;
  const inf = inflight.get(lang);
  if (inf?.has(text)) return;
  if (!pending.has(lang)) pending.set(lang, new Set());
  pending.get(lang)!.add(text);
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 120);
}

async function flush() {
  flushTimer = null;
  const batches = Array.from(pending.entries());
  pending.clear();
  await Promise.all(
    batches.map(async ([lang, set]) => {
      const texts = Array.from(set);
      if (!texts.length) return;
      if (!inflight.has(lang)) inflight.set(lang, new Set());
      const inf = inflight.get(lang)!;
      texts.forEach((t) => inf.add(t));
      try {
        // Chunk to avoid huge prompts
        const chunks: string[][] = [];
        for (let i = 0; i < texts.length; i += 40) chunks.push(texts.slice(i, i + 40));
        for (const chunk of chunks) {
          const { data, error } = await supabase.functions.invoke("translate", {
            body: { texts: chunk, target: lang },
          });
          if (!error && data?.translations) {
            chunk.forEach((src, i) => {
              cache[`${lang}::${src}`] = data.translations[i] ?? src;
            });
          } else {
            chunk.forEach((src) => {
              cache[`${lang}::${src}`] = src;
            });
          }
        }
      } catch {
        texts.forEach((src) => {
          cache[`${lang}::${src}`] = src;
        });
      } finally {
        texts.forEach((t) => inf.delete(t));
        notify();
      }
    }),
  );
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useTr(text: string | null | undefined): string {
  const { lang } = useLanguage();
  const value = useSyncExternalStore(
    subscribe,
    () => (text && lang !== "en" ? cache[`${lang}::${text}`] ?? "" : text ?? ""),
    () => text ?? "",
  );
  useEffect(() => {
    if (text && lang !== "en" && cache[`${lang}::${text}`] === undefined) {
      queueTranslation(text, lang);
    }
  }, [text, lang]);
  if (!text) return "";
  if (lang === "en") return text;
  return value || text; // fallback to source while loading
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem(STORAGE_KEY) as Lang) || "en";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("font-arabic", lang === "ar");
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (k: TKey) => translations[lang][k] ?? translations.en[k] ?? k;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

// Convenience component for auto-translated DB strings
export function Tr({ children }: { children: string | null | undefined }) {
  const text = useTr(children);
  return <>{text}</>;
}