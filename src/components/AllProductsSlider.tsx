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
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useLanguage, Tr } from "@/i18n/LanguageContext";

const AllProductsSlider = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-all-products-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !products?.length) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold tracking-wider uppercase text-primary">
            {t("products_kicker")}
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
            {t("products_title")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t("products_subtitle")}
          </p>
        </div>

        <div className="px-10">
          <Carousel
            opts={{ align: "start", loop: true, direction: dir }}
            plugins={[
              Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Card
                    className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                        <Tr>{product.title}</Tr>
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          <Tr>{product.description}</Tr>
                        </p>
                      )}
                    </CardContent>
                  </Card>
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

export default AllProductsSlider;
