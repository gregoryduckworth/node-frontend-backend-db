// Script to find translation keys used in source code but missing from translation JSON files
// Usage: node scripts/find-missing-translation-keys.js <src-dir> <translation.json>

const fs = require("fs");
const path = require("path");

function flatten(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object" && obj[k] !== null) {
      Object.assign(acc, flatten(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (
      file.endsWith(".js") ||
      file.endsWith(".ts") ||
      file.endsWith(".tsx")
    ) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function extractKeysFromFile(file) {
  const content = fs.readFileSync(file, "utf8");
  // Matches t('key.path'), t("key.path"), i18n.t('key.path'), i18n.t("key.path")
  const regex = /(?:i18n\.)?t\(["'`]([\w.-]+)["'`]/g;
  const keys = [];
  let match;
  while ((match = regex.exec(content))) {
    keys.push(match[1]);
  }
  return keys;
}

function main() {
  const [, , srcDir, translationPath] = process.argv;
  if (!srcDir || !translationPath) {
    console.error(
      "Usage: node scripts/find-missing-translation-keys.js <src-dir> <translation.json>"
    );
    process.exit(1);
  }
  const allFiles = walk(path.resolve(srcDir));
  const usedKeys = new Set();
  allFiles.forEach((file) => {
    extractKeysFromFile(file).forEach((key) => usedKeys.add(key));
  });
  const translations = JSON.parse(
    fs.readFileSync(path.resolve(translationPath), "utf8")
  );
  const flatTranslations = flatten(translations);
  const missing = Array.from(usedKeys).filter(
    (key) => !(key in flatTranslations) && key !== "-"
  );
  if (missing.length === 0) {
    console.log("No missing translation keys in source code.");
  } else {
    console.log("Missing translation keys in translation file:");
    missing.forEach((k) => console.log("  " + k));
  }
}

main();
