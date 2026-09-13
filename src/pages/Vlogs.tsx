import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, PlayCircle } from "lucide-react";

const db = supabase as any;

interface VlogRow {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string | null;
  excerpt_ar: string | null;
  body: string | null;
  body_ar: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  gallery_urls: string[] | null;
  published_at: string;
}

const youtubeId = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m?.[1] || null;
};

const Vlogs = () => {
  const { lang, t } = useLanguage();

  const { data: vlogs, isLoading } = useQuery({
    queryKey: ["vlogs"],
    queryFn: async () => {
      const { data, error } = await db
        .from("vlogs")
        .select("*")
        .eq("is_published", true)
        .order("sort_order")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as VlogRow[];
    },
  });

  const pick = (en: string | null, ar: string | null) =>
    (lang === "ar" ? ar || en : en) || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 lg:pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
              {t("vlogs_kicker")}
            </p>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
              {t("vlogs_title")}
            </h1>
            <p className="text-muted-foreground">{t("vlogs_subtitle")}</p>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground py-16 text-center">{t("loading")}</p>
          ) : !vlogs?.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl">
              <PlayCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("no_vlogs")}</p>
            </div>
          ) : (
            <div className="space-y-14 max-w-4xl">
              {vlogs.map((v) => {
                const yt = v.video_url ? youtubeId(v.video_url) : null;
                const body = pick(v.body, v.body_ar);
                return (
                  <article
                    key={v.id}
                    className="rounded-xl overflow-hidden border border-border bg-card shadow-sm"
                  >
                    {v.cover_image_url && (
                      <img
                        src={v.cover_image_url}
                        alt={pick(v.title, v.title_ar)}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-6 lg:p-8">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <time dateTime={v.published_at}>
                          {new Date(v.published_at).toLocaleDateString(
                            lang === "ar" ? "ar-SA" : "en-GB",
                            { year: "numeric", month: "long", day: "numeric" }
                          )}
                        </time>
                      </div>
                      <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
                        {pick(v.title, v.title_ar)}
                      </h2>
                      {pick(v.excerpt, v.excerpt_ar) && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {pick(v.excerpt, v.excerpt_ar)}
                        </p>
                      )}

                      {v.video_url && (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-5">
                          {yt ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${yt}`}
                              title={pick(v.title, v.title_ar)}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              loading="lazy"
                            />
                          ) : (
                            <video
                              src={v.video_url}
                              controls
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      )}

                      {body && (
                        <div className="space-y-4">
                          {body.split(/\n\s*\n/).map((p, i) => (
                            <p key={i} className="text-foreground/85 leading-relaxed whitespace-pre-line">
                              {p}
                            </p>
                          ))}
                        </div>
                      )}

                      {!!v.gallery_urls?.length && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                          {v.gallery_urls.map((url) => (
                            <img
                              key={url}
                              src={url}
                              alt={pick(v.title, v.title_ar)}
                              className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Vlogs;
