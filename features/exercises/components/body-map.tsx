"use client";

import { memo } from "react";
import { decor, musclesByView, type BodyView, type Shape } from "../data";

const COLORS = {
  selected: "#22c55e",
  selectedGlow: "drop-shadow(0 0 6px rgba(34,197,94,0.65))",
  idle: "rgba(255,255,255,0.07)",
  idleStroke: "rgba(255,255,255,0.14)",
  decor: "rgba(255,255,255,0.05)",
};

function renderShape(shape: Shape, key: string, extra: Record<string, unknown>) {
  switch (shape.type) {
    case "rect":
      return (
        <rect key={key} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...extra} />
      );
    case "ellipse":
      return <ellipse key={key} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...extra} />;
    case "circle":
      return <circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} {...extra} />;
    case "path":
      return <path key={key} d={shape.d} {...extra} />;
  }
}

interface BodyMapProps {
  view: BodyView;
  selected: string | null;
  onSelect: (id: string) => void;
  labelFor: (id: string) => string;
}

function BodyMapImpl({ view, selected, onSelect, labelFor }: BodyMapProps) {
  const visible = musclesByView[view];

  return (
    <svg
      viewBox="0 0 240 460"
      className="w-full max-w-[280px] mx-auto select-none"
      role="img"
      aria-label="Interactive body muscle map"
    >
      {/* Decorative figure parts (non-interactive) */}
      {decor[view].map((shape, i) =>
        renderShape(shape, `decor-${i}`, { fill: COLORS.decor, stroke: COLORS.idleStroke, strokeWidth: 1 }),
      )}

      {/* Clickable muscle groups */}
      {visible.map((muscle) => {
        const isSelected = selected === muscle.id;
        return (
          <g
            key={muscle.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={labelFor(muscle.id)}
            className="cursor-pointer outline-none transition-transform duration-200 hover:scale-[1.04]"
            style={{ transformBox: "fill-box", transformOrigin: "center", filter: isSelected ? COLORS.selectedGlow : undefined }}
            onClick={() => onSelect(muscle.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(muscle.id);
              }
            }}
          >
            {muscle.shapes.map((shape, i) =>
              renderShape(shape, `${muscle.id}-${i}`, {
                fill: isSelected ? COLORS.selected : COLORS.idle,
                stroke: isSelected ? COLORS.selected : COLORS.idleStroke,
                strokeWidth: 1.5,
                className: "transition-colors duration-200",
              }),
            )}
            <title>{labelFor(muscle.id)}</title>
          </g>
        );
      })}
    </svg>
  );
}

// Memoized: the SVG only re-renders when view/selected/handlers change,
// not when unrelated explorer state (e.g. the open modal) updates.
export const BodyMap = memo(BodyMapImpl);
