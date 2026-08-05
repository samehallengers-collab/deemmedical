import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Save, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageCropInput from "./ImageCropInput";
import ConfirmDelete from "./ConfirmDelete";

const AdminProductRanges = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", sort_order: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const { data: ranges, isLoading } = useQuery({
    queryKey: ["admin-product-ranges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_ranges").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `range-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let image_url: string | undefined;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }
      const payload = { ...form, ...(image_url ? { image_url } : {}) };
      if (editingId) {
        const { error } = await supabase.from("product_ranges").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_ranges").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-ranges"] });
      toast({ title: editingId ? "Range updated" : "Range added" });
      closeDialog();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_ranges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-ranges"] });
      toast({ title: "Range deleted" });
    },
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ name: "", description: "", sort_order: 0 });
    setImageFile(null);
    setCurrentImageUrl(null);
  };

  const openEdit = (range: NonNullable<typeof ranges>[0]) => {
    setEditingId(range.id);
    setForm({ name: range.name, description: range.description || "", sort_order: range.sort_order || 0 });
    setCurrentImageUrl(range.image_url || null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Ranges</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Range
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranges?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.description}</TableCell>
                  <TableCell>{r.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                      <ConfirmDelete
                        title={`Delete "${r.name}"?`}
                        description="This product range will be permanently removed."
                        onConfirm={() => deleteMutation.mutate(r.id)}
                      >
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!ranges?.length && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No product ranges yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Range" : "Add Range"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Range Image</Label>
              <ImageCropInput
                aspect={4 / 3}
                value={imageFile}
                onChange={setImageFile}
                currentUrl={currentImageUrl}
                hint="Crop to 4:3 for a clean thumbnail."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Range"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminProductRanges;
