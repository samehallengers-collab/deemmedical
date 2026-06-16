import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Upload, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageCropInput from "./ImageCropInput";

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", sort_order: 0, video_url: "", specifications: "" });
  const [selectedRangeIds, setSelectedRangeIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: ranges } = useQuery({
    queryKey: ["admin-product-ranges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_ranges").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["admin-product-range-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_range_assignments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let image_url: string | undefined;
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        sort_order: form.sort_order,
        product_range_id: selectedRangeIds.length > 0 ? selectedRangeIds[0] : null,
        video_url: form.video_url || null,
        specifications: form.specifications || null,
        ...(image_url && { image_url }),
      };

      let productId = editingId;

      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      // Update range assignments
      if (productId) {
        // Delete existing assignments
        await supabase.from("product_range_assignments").delete().eq("product_id", productId);
        // Insert new ones
        if (selectedRangeIds.length > 0) {
          const rows = selectedRangeIds.map((rid) => ({ product_id: productId!, product_range_id: rid }));
          const { error } = await supabase.from("product_range_assignments").insert(rows);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-range-assignments"] });
      toast({ title: editingId ? "Product updated" : "Product added" });
      closeDialog();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-range-assignments"] });
      toast({ title: "Product deleted" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("products").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ title: "", description: "", category: "", sort_order: 0, video_url: "", specifications: "" });
    setSelectedRangeIds([]);
    setImageFile(null);
    setCurrentImageUrl(null);
  };

  const openEdit = (product: NonNullable<typeof products>[0]) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description || "",
      category: product.category || "",
      sort_order: product.sort_order || 0,
      video_url: (product as any).video_url || "",
      specifications: (product as any).specifications || "",
    });
    // Load range assignments for this product
    const productAssignments = assignments?.filter((a) => a.product_id === product.id) || [];
    setSelectedRangeIds(productAssignments.map((a) => a.product_range_id));
    setCurrentImageUrl((product as any).image_url || null);
    setDialogOpen(true);
  };

  const getRangeNames = (productId: string) => {
    const productAssignments = assignments?.filter((a) => a.product_id === productId) || [];
    if (productAssignments.length === 0) return "—";
    return productAssignments
      .map((a) => ranges?.find((r) => r.id === a.product_range_id)?.name)
      .filter(Boolean)
      .join(", ") || "—";
  };

  const toggleRangeSelection = (rangeId: string) => {
    setSelectedRangeIds((prev) =>
      prev.includes(rangeId) ? prev.filter((id) => id !== rangeId) : [...prev, rangeId]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Product Ranges</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{getRangeNames(p.id)}</TableCell>
                    <TableCell>
                      <Switch checked={p.is_active ?? true} onCheckedChange={(v) => toggleActive.mutate({ id: p.id, is_active: v })} />
                    </TableCell>
                    <TableCell>{p.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!products?.length && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Product Ranges</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {ranges?.length ? ranges.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`range-${r.id}`}
                      checked={selectedRangeIds.includes(r.id)}
                      onCheckedChange={() => toggleRangeSelection(r.id)}
                    />
                    <label htmlFor={`range-${r.id}`} className="text-sm cursor-pointer">{r.name}</label>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No ranges available</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category (text)</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Specifications</Label>
              <Textarea value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} placeholder="Enter product specifications..." />
            </div>
            <div className="space-y-1.5">
              <Label>YouTube Video URL (optional)</Label>
              <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageCropInput
                aspect={1}
                value={imageFile}
                onChange={setImageFile}
                currentUrl={currentImageUrl}
                hint="Square crop (1:1) — used for product thumbnails."
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminProducts;
