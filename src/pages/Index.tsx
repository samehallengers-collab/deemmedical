import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BannersSlider from "@/components/BannersSlider";
import PartnersSection from "@/components/PartnersSection";
import ProductRangesSlider from "@/components/ProductRangesSlider";
import AllProductsSlider from "@/components/AllProductsSlider";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BannersSlider />
      <PartnersSection />
      <ProductRangesSlider />
      <AllProductsSlider />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
