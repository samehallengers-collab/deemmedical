import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useLanguage } from "@/i18n/LanguageContext";

const ProductsSection = () => {
  const { data: ranges, isLoading: rangesLoading } = useQuery({
    queryKey: ["public-product-ranges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_ranges").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["public-product-range-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_range_assignments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = rangesLoading || productsLoading;

  const groupedProducts = ranges?.map((range) => {
    const rangeProductIds = assignments?.filter((a) => a.product_range_id === range.id).map((a) => a.product_id) || [];
    return {
      ...range,
      products: products?.filter((p) => rangeProductIds.includes(p.id)) || [],
    };
  });

  const assignedProductIds = new Set(assignments?.map((a) => a.product_id) || []);
  const uncategorized = products?.filter((p) => !assignedProductIds.has(p.id)) || [];

  return (
    <section id="products" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-wider uppercase text-primary">Our Products</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
            Equipment You Can Rely On
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We supply a comprehensive range of medical equipment to hospitals, clinics, and laboratories across the country.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading products...</div>
        ) : (
          <div className="space-y-16">
            {groupedProducts?.map((range) =>
              range.products.length > 0 ? (
                <div key={range.id}>
                  <div className="mb-6">
                    <h3 className="font-display text-2xl font-bold text-foreground">{range.name}</h3>
                    {range.description && (
                      <p className="text-muted-foreground mt-1">{range.description}</p>
                    )}
                  </div>
                  <ProductSlider products={range.products} />
                </div>
              ) : null
            )}

            {uncategorized.length > 0 && (
              <div>
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-foreground">Other Products</h3>
                </div>
                <ProductSlider products={uncategorized} />
              </div>
            )}

            {(!products || products.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                No products available yet. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const ProductSlider = ({ products }: { products: any[] }) => {
  const { dir } = useLanguage();
  return (
  <div className="px-10">
    <Carousel
      opts={{ align: "start", loop: true, direction: dir }}
      plugins={[Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]}
      className="w-full"
    >
      <CarouselContent>
        {products.map((product, i) => (
          <CarouselItem key={product.id} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <ProductCard product={product} index={i} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
  );
};

const ProductCard = ({ product, index }: { product: any; index: number }) => {
  const navigate = useNavigate();
  return (
    <Card
      className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">{product.title}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsSection;
