import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Users, MessageSquare, Calendar, FolderOpen, Image } from "lucide-react";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminPartners from "@/components/admin/AdminPartners";
import AdminProductRanges from "@/components/admin/AdminProductRanges";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminDemoRequests from "@/components/admin/AdminDemoRequests";
import AdminBanners from "@/components/admin/AdminBanners";
import deemLogo from "@/assets/deem-logo.jpg";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/"><img src={deemLogo} alt="Deem" className="h-10" /></a>
            <span className="font-display font-semibold text-foreground">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="gap-1.5"><Package className="w-4 h-4" /> Products</TabsTrigger>
            <TabsTrigger value="ranges" className="gap-1.5"><FolderOpen className="w-4 h-4" /> Ranges</TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5"><Users className="w-4 h-4" /> Partners</TabsTrigger>
            <TabsTrigger value="banners" className="gap-1.5"><Image className="w-4 h-4" /> Banners</TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Inquiries</TabsTrigger>
            <TabsTrigger value="demos" className="gap-1.5"><Calendar className="w-4 h-4" /> Demo Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="ranges"><AdminProductRanges /></TabsContent>
          <TabsContent value="partners"><AdminPartners /></TabsContent>
          <TabsContent value="banners"><AdminBanners /></TabsContent>
          <TabsContent value="inquiries"><AdminInquiries /></TabsContent>
          <TabsContent value="demos"><AdminDemoRequests /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
