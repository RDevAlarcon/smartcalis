import type { Pattern } from "@/lib/types";
import path from "node:path";
import fs from "node:fs/promises";

const patternMedia: Record<Pattern, { thumbnail: string; mediaUrl: string }> = {
  PUSH: { thumbnail: "/exercises/push.svg", mediaUrl: "/exercises/push.svg" },
  PULL: { thumbnail: "/exercises/pull.svg", mediaUrl: "/exercises/pull.svg" },
  LEGS: { thumbnail: "/exercises/legs.svg", mediaUrl: "/exercises/legs.svg" },
  CORE: { thumbnail: "/exercises/core.svg", mediaUrl: "/exercises/core.svg" },
  SKILL: { thumbnail: "/exercises/skill.svg", mediaUrl: "/exercises/skill.svg" },
  MOBILITY: {
    thumbnail: "/exercises/mobility.svg",
    mediaUrl: "/exercises/mobility.svg",
  },
};

let cachedFiles: Promise<Set<string>> | null = null;

async function getExerciseFiles() {
  if (!cachedFiles) {
    const base = path.join(process.cwd(), "public", "exercises");
    cachedFiles = fs
      .readdir(base)
      .then((files) => new Set(files.map((file) => file.toLowerCase())))
      .catch(() => new Set());
  }
  return cachedFiles;
}

const aliasMap: Record<string, string> = {
  invertedrow: "inverterrow",
  mountainclimber: "mountaingclimber",
  muscleup: "mucleup",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/90\/90/g, "9090")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/(^-|-$)/g, "");
}

export async function resolveExerciseMedia(name: string, pattern: Pattern) {
  const files = await getExerciseFiles();
  const slug = slugify(name);
  const baseName = aliasMap[slug] ?? slug;
  const extensions = ["jpg", "png", "svg"];

  for (const ext of extensions) {
    const fileName = `${baseName}.${ext}`;
    if (files.has(fileName)) {
      const url = `/exercises/${fileName}`;
      return { thumbnail: url, mediaUrl: url };
    }
  }

  return patternMedia[pattern];
}
