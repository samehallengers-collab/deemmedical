import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage, Tr, useTr } from "@/i18n/LanguageContext";

const ProductDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: rangeNames } = useQuery({
    queryKey: ["product-range-names", id],
    queryFn: async () => {
      const { data: assignments, error: aErr } = await supabase
        .from("product_range_assignments")
        .select("product_range_id")
        .eq("product_id", id!);
      if (aErr) throw aErr;
      if (!assignments?.length) return [];
      const rangeIds = assignments.map((a) => a.product_range_id);
      const { data: ranges, error: rErr } = await supabase
        .from("product_ranges")
        .select("name")
        .in("id", rangeIds);
      if (rErr) throw rErr;
      return ranges?.map((r) => r.name) || [];
    },
    enabled: !!id,
  });

  const youtubeEmbedUrl = product?.video_url ? getYouTubeEmbedUrl(product.video_url) : null;
  const translatedDescription = useTr(product?.description ?? "");
  const translatedSpecs = useTr(product?.specifications ?? "");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <Link to="/products">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t("back_to_products")}
            </Button>
          </Link>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-20">{t("loading")}</div>
          ) : !product ? (
            <div className="text-center text-muted-foreground py-20">{t("product_not_found")}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {rangeNames && rangeNames.length > 0 && (
                  <span className="text-sm font-semibold tracking-wider uppercase text-primary">
                    <Tr>{rangeNames.join(" · ")}</Tr>
                  </span>
                )}
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground"><Tr>{product.title}</Tr></h1>

                {product.description && (
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground mb-2">{t("description")}</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{translatedDescription}</p>
                  </div>
                )}

                {product.specifications && (
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground mb-2">{t("specifications")}</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{translatedSpecs}</p>
                  </div>
                )}

                {youtubeEmbedUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 w-fit">
                        <Play className="w-4 h-4" /> {t("watch_video")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0 overflow-hidden">
                      <div className="aspect-video w-full">
                        <iframe
                          src={youtubeEmbedUrl}
                          title={`${product.title} video`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    } else if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default ProductDetail;
