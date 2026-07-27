import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Crop as CropIcon, X } from "lucide-react";

interface ImageCropInputProps {
  aspect: number;
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  label?: string;
  hint?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const getCroppedFile = async (
  src: string,
  area: Area,
  fileName: string,
): Promise<File> => {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  // Cap max width to keep files reasonable
  const maxW = 2000;
  const scale = area.width > maxW ? maxW / area.width : 1;
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Crop failed"));
        const base = fileName.replace(/\.[^.]+$/, "");
        resolve(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    ),
  );
};

const ImageCropInput = ({
  aspect,
  value,
  onChange,
  currentUrl,
  label = "Image",
  hint,
}: ImageCropInputProps) => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>("image.jpg");
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setOriginalName(f.name);
    const url = URL.createObjectURL(f);
    setSourceUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setOpen(true);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const confirmCrop = async () => {
    if (!sourceUrl || !areaPixels) return;
    const file = await getCroppedFile(sourceUrl, areaPixels, originalName);
    onChange(file);
    URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setOpen(false);
  };

  const cancelCrop = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setOpen(false);
  };

  const displayUrl = previewUrl || currentUrl || null;
  const inputId = `imgcrop-${label.replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {displayUrl ? (
          <div className="relative">
            <img
              src={displayUrl}
              alt="Preview"
              className="w-28 h-28 object-cover rounded-md border bg-muted"
              style={{ aspectRatio: aspect }}
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center shadow"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div
            className="w-28 h-28 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground bg-muted/40"
            style={{ aspectRatio: aspect }}
          >
            No image
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <Upload className="w-4 h-4" />
            {displayUrl ? "Replace image" : "Choose image"}
          </Button>
          {displayUrl && !value && currentUrl && (
            <p className="text-xs text-muted-foreground">Current image shown. Pick a new file to crop &amp; replace.</p>
          )}
          {value && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CropIcon className="w-3 h-3" /> Cropped preview ready ({Math.round(value.size / 1024)} KB)
            </p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <input id={inputId} type="file" accept="image/*" className="hidden" onChange={onFilePick} />

      <Dialog open={open} onOpenChange={(o) => !o && cancelCrop()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden">
            {sourceUrl && (
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                minZoom={0.2}
                maxZoom={4}
                zoomSpeed={0.2}
                restrictPosition={false}
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Zoom</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setZoom(0.2);
                  setCrop({ x: 0, y: 0 });
                }}
              >
                Fit whole image
              </Button>
            </div>
            <Slider value={[zoom]} min={0.2} max={4} step={0.02} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelCrop}>Cancel</Button>
            <Button type="button" onClick={confirmCrop}>Apply crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCropInput;