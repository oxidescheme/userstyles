import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const STYLES_DIR = join(import.meta.dir, "..", "styles");
const REQUIRED_FIELDS = ["name", "namespace", "version", "description", "author", "license", "preprocessor"];
const REQUIRED_IMPORT = "https://raw.githubusercontent.com/oxidescheme/userstyles/main/lib/lib.less";
const OXIDE_COLORS = new Set([
  "mantle", "base", "surface0", "surface1",
  "bright_text", "text", "subtext0", "subtext1", "subtext2",
  "red", "orange", "yellow", "green", "teal", "sky", "blue", "purple", "pink",
  "bright_red", "bright_orange", "bright_yellow", "bright_green", "bright_teal", "bright_sky", "bright_blue", "bright_purple", "bright_pink",
  "amber", "jade", "ice",
  "accent",
]);

interface LintError {
  file: string;
  message: string;
}

function parseUsercssMeta(content: string): Map<string, string> {
  const meta = new Map<string, string>();
  const match = content.match(/==UserStyle==\s*\n([\s\S]*?)\n\s*==\/UserStyle==/);
  if (!match) return meta;

  for (const line of match[1]!.split("\n")) {
    const m = line.match(/@(\w+)\s+(.+)/);
    if (m) meta.set(m[1]!, m[2]!.trim());
  }
  return meta;
}

async function lint(): Promise<number> {
  const errors: LintError[] = [];
  let styleCount = 0;

  let dirEntries: string[];
  try {
    dirEntries = await readdir(STYLES_DIR);
  } catch {
    console.log("No styles/ directory found. Nothing to lint.");
    return 0;
  }

  for (const slug of dirEntries) {
    const dirPath = join(STYLES_DIR, slug);
    let isDir: boolean;
    try {
      const stat = await Bun.file(dirPath).stat();
      isDir = stat.isDirectory();
    } catch {
      continue;
    }
    if (!isDir) continue;

    const file = join(STYLES_DIR, slug, "oxide.user.less");
    styleCount++;

    let content: string;
    try {
      content = await readFile(file, "utf-8");
    } catch {
      errors.push({ file: slug, message: `Missing oxide.user.less in styles/${slug}/` });
      continue;
    }

    const meta = parseUsercssMeta(content);

    for (const field of REQUIRED_FIELDS) {
      if (!meta.has(field)) {
        errors.push({ file: slug, message: `Missing @${field} in metadata` });
      }
    }

    if (!content.includes(REQUIRED_IMPORT)) {
      errors.push({ file: slug, message: `Missing @import for lib.less` });
    }

    if (!content.includes("@-moz-document")) {
      errors.push({ file: slug, message: "Missing @-moz-document rule" });
    }

    if (!content.includes("#lib.palette()")) {
      errors.push({ file: slug, message: "Missing #lib.palette() call" });
    }

    const namespace = meta.get("namespace") ?? "";
    if (!namespace.includes(slug)) {
      errors.push({ file: slug, message: `Namespace should contain the slug "${slug}"` });
    }

    const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/g;
    const contentAfterMeta = content.replace(/==UserStyle==[\s\S]*?==\/UserStyle==/, "");
    const hardcodedHexColors = contentAfterMeta.match(hexColorRegex);

    if (hardcodedHexColors) {
      const oxideHexValues = new Set([
        "#121212", "#161616", "#222222", "#222222",
        "#eeeeee", "#cecece", "#aeaeae", "#808080", "#555555",
        "#ed756e", "#e48233", "#c39900", "#5bb661", "#00baaa", "#00b3d6", "#3ba6f5", "#968ff7", "#cc7bd1",
        "#ff9890", "#ffa156", "#e3b831", "#7bd77f", "#00dcca", "#00d5f9", "#6fc6ff", "#b5b2ff", "#dd8be2",
        "#452b28", "#263826", "#213546",
      ]);

      const problematic = hardcodedHexColors.filter(
        (c) => oxideHexValues.has(c.toLowerCase()),
      );
      if (problematic.length > 0) {
        errors.push({
          file: slug,
          message: `Hardcoded oxide colors found: ${[...new Set(problematic)].join(", ")}. Use @variables from #lib.palette() instead.`,
        });
      }
    }
  }

  if (errors.length > 0) {
    console.error("Lint errors:\n");
    for (const { file, message } of errors) {
      console.error(`  styles/${file}/oxide.user.less: ${message}`);
    }
    console.error(`\n${errors.length} error(s) in ${styleCount} userstyle(s).`);
    return 1;
  }

  console.log(`All ${styleCount} userstyle(s) passed lint.`);
  return 0;
}

const exitCode = await lint();
process.exit(exitCode);