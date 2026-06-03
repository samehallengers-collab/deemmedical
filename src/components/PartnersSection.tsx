import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const PartnersSection = () => {
  const { data: partners, isLoading } = useQuery({
    queryKey: ["public-partners-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !partners?.length) return null;

  return (
    <section id="partners" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Partners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We collaborate with world-leading medical equipment manufacturers to bring you the best in healthcare technology.
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true, dragFree: true }}
          plugins={[
            Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {partners.map((partner) => (
              <CarouselItem
                key={partner.id ?? partner.name}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <a
                  href={partner.website || undefined}
                  target={partner.website ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="block w-full h-24 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm p-3"
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">
                      {partner.name}
                    </span>
                  )}
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default PartnersSection;
