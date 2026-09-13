import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { vlogs } from "@/data/vlogs";
import { CalendarDays, PlayCircle } from "lucide-react";

const Vlogs = () => {
  const { lang, t } = useLanguage();

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

          {vlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl">
              <PlayCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("no_vlogs")}</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {vlogs.map((vlog) => (
                <article
                  key={vlog.id}
                  className="rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-black">
                    {vlog.type === "youtube" && vlog.videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${vlog.videoId}`}
                        title={lang === "ar" ? vlog.title_ar : vlog.title_en}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={vlog.src}
                        poster={vlog.poster}
                        controls
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <time dateTime={vlog.date}>
                        {new Date(vlog.date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h2 className="font-heading font-semibold text-lg text-foreground mb-1.5">
                      {lang === "ar" ? vlog.title_ar : vlog.title_en}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lang === "ar" ? vlog.description_ar : vlog.description_en}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Vlogs;
