import { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Crop as CropIcon, X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropInputProps {
  aspect: number;
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  label?: string;
  hint?: string;
}

const getCroppedFile = async (
  image: HTMLImageElement,
  area: PixelCrop,
  fileName: string,
): Promise<File> => {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const sx = area.x * scaleX;
  const sy = area.y * scaleY;
  const sw = area.width * scaleX;
  const sh = area.height * scaleY;

  const canvas = document.createElement("canvas");
  const maxW = 2000;
  const scale = sw > maxW ? maxW / sw : 1;
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

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
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [lockRatio, setLockRatio] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputIdRef = useRef(`imgcrop-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const buildInitialCrop = (w: number, h: number, useAspect: boolean) => {
    if (useAspect) {
      return centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h),
        w,
        h,
      );
    }
    return centerCrop({ unit: "%" as const, width: 90, height: 90 }, w, h);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(buildInitialCrop(width, height, lockRatio));
  };

  const toggleRatio = (locked: boolean) => {
    setLockRatio(locked);
    const img = imgRef.current;
    if (img) setCrop(buildInitialCrop(img.width, img.height, locked));
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setOriginalName(f.name);
    setCrop(undefined);
    setCompletedCrop(null);
    setSourceUrl(URL.createObjectURL(f));
    setOpen(true);
  };

  const confirmCrop = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) return;
    const file = await getCroppedFile(imgRef.current, completedCrop, originalName);
    onChange(file);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setOpen(false);
  };

  const cancelCrop = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setOpen(false);
  };

  const displayUrl = previewUrl || currentUrl || null;
  const inputId = inputIdRef.current;

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
          <div className="flex items-center justify-center bg-muted rounded-md overflow-auto max-h-[60vh] p-2">
            {sourceUrl && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={lockRatio ? aspect : undefined}
                keepSelection
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  src={sourceUrl}
                  alt="Crop source"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "55vh", maxWidth: "100%" }}
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div>
              <Label htmlFor="lock-ratio" className="text-xs">Lock to recommended ratio</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to drag any side or corner freely.
                {completedCrop
                  ? ` Selection: ${Math.round(completedCrop.width)}×${Math.round(completedCrop.height)}px`
                  : ""}
              </p>
            </div>
            <Switch id="lock-ratio" checked={lockRatio} onCheckedChange={toggleRatio} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelCrop}>Cancel</Button>
            <Button type="button" onClick={confirmCrop} disabled={!completedCrop?.width}>Apply crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCropInput;
