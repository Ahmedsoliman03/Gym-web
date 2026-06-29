// Static, backend-free data for the interactive Body Muscle Map.
// Geometry is intentionally stylized (blocky athletic figure) so each muscle
// group is an easy, recognizable click target. Labels/exercises live in the
// `Exercises` i18n namespace, keyed by the `id` below.

export type BodyView = "front" | "back";

export type Shape =
  | { type: "rect"; x: number; y: number; w: number; h: number; rx: number }
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "path"; d: string };

  
export interface MuscleRegion {
  id: string;
  view: BodyView;
  shapes: Shape[];
}

// Decorative, non-clickable bits (head, hands, feet, joints) that turn the
// muscle blocks into a readable human figure. viewBox is 0 0 240 460.
export const decor: Record<BodyView, Shape[]> = {
  front: [
    { type: "circle", cx: 120, cy: 36, r: 22 }, // head
    { type: "rect", x: 112, y: 56, w: 16, h: 12, rx: 6 }, // neck
    { type: "circle", cx: 48, cy: 232, r: 10 }, // left hand
    { type: "circle", cx: 192, cy: 232, r: 10 }, // right hand
    { type: "rect", x: 96, y: 410, w: 22, h: 14, rx: 6 }, // left foot
    { type: "rect", x: 122, y: 410, w: 22, h: 14, rx: 6 }, // right foot
  ],
  back: [
    { type: "circle", cx: 120, cy: 36, r: 22 },
    { type: "rect", x: 112, y: 56, w: 16, h: 12, rx: 6 },
    { type: "circle", cx: 48, cy: 232, r: 10 },
    { type: "circle", cx: 192, cy: 232, r: 10 },
    { type: "rect", x: 96, y: 410, w: 22, h: 14, rx: 6 },
    { type: "rect", x: 122, y: 410, w: 22, h: 14, rx: 6 },
  ],
};

export const muscles: MuscleRegion[] = [
  // ---------- FRONT ----------
  {
    id: "shoulders",
    view: "front",
    shapes: [
      { type: "ellipse", cx: 80, cy: 92, rx: 18, ry: 15 },
      { type: "ellipse", cx: 160, cy: 92, rx: 18, ry: 15 },
    ],
  },
  {
    id: "chest",
    view: "front",
    shapes: [
      { type: "rect", x: 92, y: 80, w: 24, h: 34, rx: 11 },
      { type: "rect", x: 124, y: 80, w: 24, h: 34, rx: 11 },
    ],
  },
  {
    id: "biceps",
    view: "front",
    shapes: [
      { type: "rect", x: 58, y: 112, w: 20, h: 46, rx: 10 },
      { type: "rect", x: 162, y: 112, w: 20, h: 46, rx: 10 },
    ],
  },
  {
    id: "forearms",
    view: "front",
    shapes: [
      { type: "rect", x: 50, y: 160, w: 18, h: 56, rx: 9 },
      { type: "rect", x: 172, y: 160, w: 18, h: 56, rx: 9 },
    ],
  },
  {
    id: "abs",
    view: "front",
    shapes: [{ type: "rect", x: 100, y: 120, w: 40, h: 72, rx: 14 }],
  },
  {
    id: "quads",
    view: "front",
    shapes: [
      { type: "rect", x: 94, y: 200, w: 24, h: 86, rx: 12 },
      { type: "rect", x: 122, y: 200, w: 24, h: 86, rx: 12 },
    ],
  },
  // ---------- BACK ----------
  {
    id: "traps",
    view: "back",
    shapes: [{ type: "path", d: "M96 72 L144 72 L132 100 L108 100 Z" }],
  },
  {
    id: "back",
    view: "back",
    shapes: [
      { type: "path", d: "M92 104 L120 110 L114 168 L96 150 Z" },
      { type: "path", d: "M148 104 L120 110 L126 168 L144 150 Z" },
    ],
  },
  {
    id: "triceps",
    view: "back",
    shapes: [
      { type: "rect", x: 58, y: 112, w: 20, h: 50, rx: 10 },
      { type: "rect", x: 162, y: 112, w: 20, h: 50, rx: 10 },
    ],
  },
  {
    id: "glutes",
    view: "back",
    shapes: [
      { type: "rect", x: 94, y: 188, w: 24, h: 36, rx: 14 },
      { type: "rect", x: 122, y: 188, w: 24, h: 36, rx: 14 },
    ],
  },
  {
    id: "hamstrings",
    view: "back",
    shapes: [
      { type: "rect", x: 94, y: 228, w: 24, h: 64, rx: 12 },
      { type: "rect", x: 122, y: 228, w: 24, h: 64, rx: 12 },
    ],
  },
  {
    id: "calves",
    view: "back",
    shapes: [
      { type: "rect", x: 96, y: 300, w: 22, h: 64, rx: 11 },
      { type: "rect", x: 122, y: 300, w: 22, h: 64, rx: 11 },
    ],
  },
];

// Precompute the per-view groupings once at module load so components never
// filter the muscle list on every render.
export const musclesByView: Record<BodyView, MuscleRegion[]> = {
  front: muscles.filter((m) => m.view === "front"),
  back: muscles.filter((m) => m.view === "back"),
};

export const muscleIdsByView: Record<BodyView, string[]> = {
  front: musclesByView.front.map((m) => m.id),
  back: musclesByView.back.map((m) => m.id),
};
