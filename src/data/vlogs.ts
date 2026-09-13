// Static vlog entries. Add one object per video.
// For a YouTube video: { type: "youtube", videoId: "dQw4w9WgXcQ", ... }
// For an uploaded video file: place the .mp4 asset in src/assets and use
// { type: "upload", src: "/__l5e/assets-v1/....mp4", ... }

export interface Vlog {
  id: string;
  type: "youtube" | "upload";
  /** YouTube video ID (the part after watch?v=) — youtube type only */
  videoId?: string;
  /** Direct video URL (.mp4 asset) — upload type only */
  src?: string;
  /** Optional poster/thumbnail image URL — upload type only */
  poster?: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  date: string; // ISO date, e.g. "2026-09-13"
}

export const vlogs: Vlog[] = [
  // Example (YouTube):
  // {
  //   id: "vlog-1",
  //   type: "youtube",
  //   videoId: "VIDEO_ID_HERE",
  //   title_en: "Our latest equipment showcase",
  //   title_ar: "عرض أحدث معداتنا",
  //   description_en: "A look at our newest medical equipment arrivals.",
  //   description_ar: "نظرة على أحدث المعدات الطبية الواصلة لدينا.",
  //   date: "2026-09-01",
  // },
];
