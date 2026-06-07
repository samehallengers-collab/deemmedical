import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
}

const BannersSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id,title,description,image_url,link_url")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setBanners(data || []));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  const go = (dir: number) =>
    setIndex((i) => (i + dir + banners.length) % banners.length);

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-muted aspect-[16/7] md:aspect-[21/8]">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {b.image_url && (
                <img
                  src={b.image_url}
                  alt={b.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              )}
              {(b.title || b.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                  <div className="p-6 md:p-12 lg:p-16 max-w-3xl text-white">
                    {b.title && (
                      <h3 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold mb-3">
                        {b.title}
                      </h3>
                    )}
                    {b.description && (
                      <p className="text-sm md:text-base lg:text-lg opacity-90 mb-4">
                        {b.description}
                      </p>
                    )}
                    {b.link_url && (
                      <Button asChild size="lg" variant="secondary">
                        <a href={b.link_url} target="_blank" rel="noopener noreferrer">
                          Learn More
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {banners.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-8 bg-white" : "w-2 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannersSlider;