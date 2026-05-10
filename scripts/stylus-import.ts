import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "usercss-meta";
import { createHash } from "node:crypto";

const STYLES_DIR = join(import.meta.dir, "..", "styles");
const DIST_DIR = join(import.meta.dir, "..", "dist");
const OUTPUT_FILE = join(DIST_DIR, "import.json");

async function getUserstylesFiles(): Promise<string[]> {
  try {
    const entries = await readdir(STYLES_DIR, { withFileTypes: true });
    return entries
      .filter((d) => d.isDirectory())
      .map((d) => join(STYLES_DIR, d.name, "oxide.user.less"))
      .filter((p) => p.endsWith(".user.less"));
  } catch {
    return [];
  }
}

async function calcStyleDigest(style: Record<string, unknown>): Promise<string> {
  const data = JSON.stringify(style);
  return createHash("sha256").update(data).digest("hex");
}

async function main() {
  const files = await getUserstylesFiles();

  if (files.length === 0) {
    console.log("No userstyles found. Creating empty import.json.");
    await Bun.write(OUTPUT_FILE, JSON.stringify([], null, 2));
    return;
  }

  const stylusSettings = {
    settings: {
      updateInterval: 24,
      updateOnlyEnabled: false,
      patchCsp: true,
    },
  };

  const data: unknown[] = [stylusSettings];

  for (const file of files) {
    const content = await Bun.file(file).text();

    let metadata: Record<string, unknown>;
    try {
      const result = parse(content, { allowUnknown: true });
      metadata = result.metadata;
    } catch (err) {
      console.error(`Error parsing metadata from ${file}:`, err);
      continue;
    }

    const userstyle: Record<string, unknown> = {
      enabled: true,
      name: metadata.name,
      description: metadata.description,
      author: metadata.author,
      url: metadata.url ?? null,
      updateUrl: metadata.updateURL,
      usercssData: metadata,
      sourceCode: content,
    };

    userstyle.originalDigest = await calcStyleDigest(userstyle);
    data.push(userstyle);
  }

  await Bun.write(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`Generated import.json with ${data.length - 1} userstyle(s).`);
}

main();