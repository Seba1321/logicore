import { describe, expect, it } from "vitest";

import { optimizedImage } from "@/lib/image";
import { team } from "@/data/team";
import { projects, projectCategories } from "@/data/projects";

describe("data layer", () => {
  it("team has at least one cofounder and Jimmy", () => {
    expect(team.length).toBeGreaterThanOrEqual(4);
    expect(team.some((member) => member.tag === "Cofounder")).toBe(true);
    expect(team.some((member) => member.name === "Jimmy Gallardo")).toBe(true);
  });

  it("each team member has required fields", () => {
    for (const member of team) {
      expect(member.name.length).toBeGreaterThan(0);
      expect(member.role.length).toBeGreaterThan(0);
      expect(member.photo).toMatch(/^\/team\//);
      expect(member.bio.length).toBeGreaterThan(50);
      expect(Array.isArray(member.experience)).toBe(true);
    }
  });

  it("projects has a featured case and unique ids", () => {
    expect(projects.some((project) => project.featured)).toBe(true);
    const ids = new Set(projects.map((project) => project.id));
    expect(ids.size).toBe(projects.length);
  });

  it("projectCategories includes 'Todos'", () => {
    expect(projectCategories[0]).toBe("Todos");
  });
});

describe("optimizedImage", () => {
  it("rewrites unsplash urls to webp + width", () => {
    const url = optimizedImage("https://images.unsplash.com/photo-123?w=400&h=300&fit=crop", 720);
    expect(url).toContain("fm=webp");
    expect(url).toContain("w=720");
  });

  it("passes through non-unsplash urls untouched", () => {
    const url = "/team/Robert.jpeg";
    expect(optimizedImage(url, 800)).toBe(url);
  });

  it("does not throw on malformed urls", () => {
    expect(() => optimizedImage("not-a-url", 800)).not.toThrow();
  });
});
