import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Package } from "lucide-react";
import { useLanguage, Tr } from "@/i18n/LanguageContext";

const ProductRangesSlider = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const { data: ranges, isLoading } = useQuery({
    queryKey: ["public-product-ranges-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_ranges")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !ranges?.length) return null;

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-wider uppercase text-primary">
            {t("ranges_kicker")}
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
            {t("ranges_title")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t("ranges_subtitle")}
          </p>
        </div>

        <div className="px-10">
          <Carousel
            opts={{ align: "start", loop: true, direction: dir }}
            plugins={[
              Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {ranges.map((range) => (
                <CarouselItem
                  key={range.id}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div
                    className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/products?range=${range.id}`)}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {range.image_url ? (
                        <img
                          src={range.image_url}
                          alt={range.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-display font-semibold text-lg text-foreground">
                        <Tr>{range.name}</Tr>
                      </h3>
                      {range.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          <Tr>{range.description}</Tr>
                        </p>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ProductRangesSlider;
