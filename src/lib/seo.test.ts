import { describe, expect, it } from "vitest";
import { buildMetadata, organizationJsonLd, siteConfig } from "./seo";

describe("seo helpers", () => {
  it("builds metadata with open graph", () => {
    const meta = buildMetadata();
    expect(meta.title).toBeDefined();
    expect(siteConfig.name).toBe("LegalAid");
  });

  it("emits organization json-ld", () => {
    const json = organizationJsonLd() as { "@type": string };
    expect(json["@type"]).toBe("Organization");
  });
});
