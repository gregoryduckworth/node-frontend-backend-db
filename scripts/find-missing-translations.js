// Script to find missing translation keys between multiple JSON files
// Usage: node scripts/find-missing-translations.js <lang1.json> <lang2.json> [<lang3.json> ...]

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

function findMissingKeys(base, compare) {
  return Object.keys(base).filter((key) => !(key in compare));
}

function main() {
  // Accept any number of language files as arguments
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: node scripts/find-missing-translations.js <lang1.json> <lang2.json> [<lang3.json> ...]"
    );
    process.exit(1);
  }
  // Map: lang code from filename (e.g. en from .../en/translation.json)
  const langFiles = args.map((file) => ({
    file,
    lang: path.basename(path.dirname(file)),
    flat: flatten(JSON.parse(fs.readFileSync(path.resolve(file), "utf8"))),
  }));

  // Compare each language file to every other
  for (let i = 0; i < langFiles.length; i++) {
    for (let j = 0; j < langFiles.length; j++) {
      if (i === j) continue;
      const missing = findMissingKeys(langFiles[i].flat, langFiles[j].flat);
      if (missing.length > 0) {
        console.log(
          `Missing in ${langFiles[j].lang} (compared to ${langFiles[i].lang}):`
        );
        missing.forEach((k) => console.log("  " + k));
      }
    }
  }
  if (
    langFiles.length === 2 &&
    findMissingKeys(langFiles[0].flat, langFiles[1].flat).length === 0 &&
    findMissingKeys(langFiles[1].flat, langFiles[0].flat).length === 0
  ) {
    console.log("No missing translation keys. Both files are in sync.");
  }
}

main();
