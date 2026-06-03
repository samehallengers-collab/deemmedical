import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import allergensLogo from "@/assets/partners/allengers.jpg";
import seesheenLogo from "@/assets/partners/seesheen.png";

const fallbackPartners = [
  { name: "Allengers", logo_url: allergensLogo, website: null as string | null },
  { name: "Seesheen", logo_url: seesheenLogo, website: null as string | null },
];

const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: partnersData } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const partners = partnersData && partnersData.length > 0 ? partnersData : fallbackPartners;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.5;
      if (scrollPos >= container.scrollWidth / 2) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(scroll); };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
    };
  }, [partners.length]);

  // Duplicate items for seamless loop
  const items = [...partners, ...partners];

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

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-hidden"
        >
          {items.map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-40 h-24 bg-background border border-border rounded-xl flex items-center justify-center shadow-sm p-3"
            >
              {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <span className="text-sm text-muted-foreground font-medium">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
