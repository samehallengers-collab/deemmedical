import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageCropInput from "./ImageCropInput";
import ConfirmDelete from "./ConfirmDelete";

interface Vlog {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string | null;
  excerpt_ar: string | null;
  body: string | null;
  body_ar: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  gallery_urls: string[] | null;
  is_published: boolean;
  sort_order: number;
  published_at: string;
}

const db = supabase as any;

const emptyForm = {
  title: "",
  title_ar: "",
  excerpt: "",
  excerpt_ar: "",
  body: "",
  body_ar: "",
  video_url: "",
  published_at: new Date().toISOString().slice(0, 10),
  sort_order: 0,
  is_published: true,
};

const uploadFile = async (file: File, folder: string) => {
  const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
  const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
};

const AdminVlogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const { data: vlogs, isLoading } = useQuery({
    queryKey: ["admin-vlogs"],
    queryFn: async () => {
      const { data, error } = await db
        .from("vlogs")
        .select("*")
        .order("sort_order")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Vlog[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Your session expired. Please sign in again and retry.");
      if (!form.title.trim()) throw new Error("Title is required.");

      let cover_image_url: string | undefined;
      if (coverFile) cover_image_url = await uploadFile(coverFile, "vlogs/covers");

      const newGallery: string[] = [];
      for (const f of galleryFiles) newGallery.push(await uploadFile(f, "vlogs/gallery"));

      let video_url = form.video_url.trim() || null;
      if (videoFile) video_url = await uploadFile(videoFile, "vlogs/videos");

      const payload = {
        title: form.title.trim(),
        title_ar: form.title_ar.trim() || null,
        excerpt: form.excerpt.trim() || null,
        excerpt_ar: form.excerpt_ar.trim() || null,
        body: form.body.trim() || null,
        body_ar: form.body_ar.trim() || null,
        video_url,
        gallery_urls: [...existingGallery, ...newGallery],
        is_published: form.is_published,
        sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
        published_at: new Date(form.published_at).toISOString(),
        ...(cover_image_url && { cover_image_url }),
      };

      if (editingId) {
        const { error } = await db.from("vlogs").update(payload).eq("id", editingId);
        if (error) throw new Error(`Saving failed: ${error.message}`);
      } else {
        const { error } = await db.from("vlogs").insert(payload);
        if (error) throw new Error(`Saving failed: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["vlogs"] });
      toast({ title: editingId ? "Vlog updated" : "Vlog added" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("vlogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["vlogs"] });
      toast({ title: "Vlog deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setCurrentCoverUrl(null);
    setGalleryFiles([]);
    setExistingGallery([]);
    setVideoFile(null);
  };

  const openEdit = (v: Vlog) => {
    setEditingId(v.id);
    setForm({
      title: v.title || "",
      title_ar: v.title_ar || "",
      excerpt: v.excerpt || "",
      excerpt_ar: v.excerpt_ar || "",
      body: v.body || "",
      body_ar: v.body_ar || "",
      video_url: v.video_url || "",
      published_at: (v.published_at || new Date().toISOString()).slice(0, 10),
      sort_order: v.sort_order || 0,
      is_published: v.is_published ?? true,
    });
    setCurrentCoverUrl(v.cover_image_url || null);
    setExistingGallery(v.gallery_urls || []);
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vlogs / Articles</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Vlog
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vlogs?.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    {v.cover_image_url ? (
                      <img src={v.cover_image_url} alt={v.title} className="w-20 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">None</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate" title={v.title}>{v.title}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(v.published_at).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {v.video_url ? "Video" : ""}
                    {v.video_url && v.gallery_urls?.length ? " + " : ""}
                    {v.gallery_urls?.length ? `${v.gallery_urls.length} photo(s)` : ""}
                    {!v.video_url && !v.gallery_urls?.length ? "—" : ""}
                  </TableCell>
                  <TableCell>{v.is_published ? "Yes" : "No"}</TableCell>
                  <TableCell>{v.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
                      <ConfirmDelete
                        title="Delete this vlog?"
                        description="The article and its media links will be permanently removed from the website."
                        onConfirm={() => deleteMutation.mutate(v.id)}
                      >
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!vlogs?.length && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No vlogs yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Vlog" : "Add Vlog"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Title (Arabic)</Label>
                <Input dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} placeholder="Leave empty to auto-translate" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Short summary (English)</Label>
                <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Short summary (Arabic)</Label>
                <Textarea rows={2} dir="rtl" value={form.excerpt_ar} onChange={(e) => setForm({ ...form, excerpt_ar: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Article text (English)</Label>
                <Textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the full article. Leave a blank line between paragraphs." />
              </div>
              <div className="space-y-1.5">
                <Label>Article text (Arabic)</Label>
                <Textarea rows={8} dir="rtl" value={form.body_ar} onChange={(e) => setForm({ ...form, body_ar: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cover photo</Label>
              <ImageCropInput
                aspect={16 / 9}
                value={coverFile}
                onChange={setCoverFile}
                currentUrl={currentCoverUrl}
                hint="16:9 cover shown at the top of the article."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Extra photos</Label>
              {existingGallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingGallery.map((url) => (
                    <div key={url} className="relative">
                      <img src={url} alt="" className="w-20 h-16 object-cover rounded border border-border" />
                      <button
                        type="button"
                        onClick={() => setExistingGallery(existingGallery.filter((u) => u !== url))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
              />
              {galleryFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">{galleryFiles.length} new photo(s) will be added.</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Video link (YouTube or direct URL)</Label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="space-y-1.5">
                <Label>...or upload a video file</Label>
                <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Publish date</Label>
                <Input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>Published (visible on the website)</Label>
            </div>

            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Vlog"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminVlogs;
