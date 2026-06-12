// Dependency-free build script.
// Render runs `npm start` (mapped here) and serves the `build/` directory.
// Copies everything in src/ into build/.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const OUT = path.join(__dirname, "build");

function copyDir(src, out) {
  fs.mkdirSync(out, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(out, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(SRC, OUT);
console.log(`Built site: copied src/ -> build/`);
