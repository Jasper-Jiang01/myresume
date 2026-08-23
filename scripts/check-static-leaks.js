/**
 * 扫描 public/ 静态产物，拦截 Vite 开发运行时泄漏到生产环境
 *（典型症状：每次页面加载请求 /@vite/client 并 net::ERR_ABORTED）。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");
const LEAK_RE = /\/@vite\/(?:client|env)|@react-refresh/;
const SCAN_EXT = new Set([".html", ".js", ".css", ".svg", ".txt", ".json"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".src" || entry.name === "node_modules") continue;
      walk(full, files);
    } else if (SCAN_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

const hits = [];
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, "utf8");
  if (LEAK_RE.test(text)) {
    hits.push(path.relative(path.join(__dirname, ".."), file));
  }
}

if (hits.length) {
  console.error("发现 Vite 开发脚本泄漏到静态产物：");
  hits.forEach((file) => console.error(`  - ${file}`));
  process.exit(1);
}

console.log("static leak check passed: 未发现 /@vite/client 或 @react-refresh");
