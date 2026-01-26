import type { Pattern } from "@/lib/types";

const patternLabels: Record<Pattern, string> = {
  PUSH: "empuje",
  PULL: "tracción",
  LEGS: "piernas",
  CORE: "zona media",
  SKILL: "habilidad",
  MOBILITY: "movilidad",
};

export function translateFocus(focus: string) {
  return focus
    .split("+")
    .map((part) => part.trim())
    .map((part) => (patternLabels as Record<string, string>)[part] ?? part)
    .join(" + ");
}

export { patternLabels };
