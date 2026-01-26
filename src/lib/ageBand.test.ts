import { describe, expect, it } from "vitest";
import { calculateAgeBand } from "@/lib/ageBand";

describe("calculateAgeBand", () => {
  const today = new Date("2026-01-25T00:00:00Z");

  it("returns TEEN for 17", () => {
    const birthDate = new Date("2008-02-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("TEEN");
  });

  it("returns PRIME for 25", () => {
    const birthDate = new Date("2000-01-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("PRIME");
  });

  it("returns BUILD for 35", () => {
    const birthDate = new Date("1990-01-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("BUILD");
  });

  it("returns REBUILD for 45", () => {
    const birthDate = new Date("1980-01-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("REBUILD");
  });

  it("returns STRONG50 for 55", () => {
    const birthDate = new Date("1970-01-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("STRONG50");
  });

  it("returns ACTIVE60 for 60+", () => {
    const birthDate = new Date("1960-01-01T00:00:00Z");
    expect(calculateAgeBand(birthDate, today)).toBe("ACTIVE60");
  });
});
