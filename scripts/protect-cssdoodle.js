/**
 * cssdoodle demo 代码保护构建脚本
 * ------------------------------------------------------------------
 * 作用：把每个 demo 目录下 `.src/`（可读源码）编译为同级的展示文件
 *      （压缩混淆版），并自动注入 `_shared/protect.js` 防护脚本。
 *
 * 用法：
 *   node scripts/protect-cssdoodle.js            # 处理所有 demo
 *   node scripts/protect-cssdoodle.js after-sign-off   # 只处理指定 demo（按目录名过滤，支持子路径包含匹配）
 *
 * 约定：
 *   - 每个 demo 目录下若存在 `.src/` 子目录，则其中的 index.html /
 *     script.js / i18n.js / style.css 视为“源码”，脚本会读取它们，
 *     压缩后覆盖写回上一级同名文件（展示文件）。
 *   - HTML 压缩后会确保 `<script src="...protect.js">` 被注入（若源码中
 *     没有则自动追加到 </body> 前；相对路径根据文件深度自动计算）。
 *   - CSS 使用“安全压缩”（只去注释和多余空白），不使用会破坏
 *     `&` 嵌套、`@import` 等现代语法的语义级压缩器。
 *   - `.src/` 目录本身不会被这个脚本处理，也不会被复制到 dist，
 *     `npm run build` 会通过 clean:src 脚本从最终产物中移除它。
 */

const fs = require("fs");
const path = require("path");
const { minify: minifyJs } = require("terser");
const { minify: minifyHtml } = require("html-minifier-terser");

const CSSDOODLE_ROOT = path.join(__dirname, "..", "public", "cssdoodle");
const SHARED_DIR_NAME = "_shared";
const PROTECT_FILE = "protect.js";

/** 安全的 CSS 压缩：只移除注释和多余空白，不做语义重写，避免破坏
 *  CSS 嵌套（&）、@import 等现代语法。 */
function safeMinifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // 移除注释
    .replace(/\n\s*/g, "") // 移除换行及其后的缩进空白
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/;}/g, "}")
    .trim();
}

/** 根据 index.html 相对 public/cssdoodle 的深度，计算 protect.js 的相对路径 */
function getProtectRelativePath(htmlDir) {
  const relFromRoot = path.relative(CSSDOODLE_ROOT, htmlDir);
  const depth = relFromRoot === "" ? 0 : relFromRoot.split(path.sep).length;
  const upSegments = "../".repeat(depth);
  return `${upSegments}${SHARED_DIR_NAME}/${PROTECT_FILE}`;
}

/** 确保 HTML 字符串中包含 protect.js 的 <script> 引用，返回处理后的 HTML */
function ensureProtectScript(html, protectRelPath) {
  const scriptTag = `<script src="${protectRelPath}"></script>`;
  // 已经引用过 protect.js（无论相对路径写法如何）则不用重复注入
  if (/protect\.js/.test(html)) {
    return html;
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${scriptTag}</body>`);
  }
  // 找不到 </body>（例如内容片段），直接前置注入，保持与历史处理一致
  return `${scriptTag}\n${html}`;
}

async function compressJs(code) {
  const result = await minifyJs(code, {
    mangle: true,
    compress: true,
  });
  return result.code || code;
}

/** 安全的 HTML 压缩兜底：仅去注释和多余空白，不做结构级解析，
 *  用于 html-minifier-terser 因源文件里存在不规范标签（如缺失属性值）
 *  而解析失败时的降级方案，保证构建流程不会中断。 */
function safeMinifyHtmlFallback(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function compressHtml(html) {
  try {
    return await minifyHtml(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
      keepClosingSlash: true,
    });
  } catch (err) {
    console.warn(
      `    ⚠ html-minifier-terser 解析失败（可能源文件存在不规范标签），已降级为安全压缩：${err.message.split("\n")[0]}`
    );
    return safeMinifyHtmlFallback(html);
  }
}

/** 处理单个 demo 目录（其中包含 .src 子目录） */
async function processDemoDir(demoDir) {
  const srcDir = path.join(demoDir, ".src");
  if (!fs.existsSync(srcDir)) return null;

  const report = { dir: path.relative(CSSDOODLE_ROOT, demoDir), files: [] };
  const entries = fs.readdirSync(srcDir);

  for (const entry of entries) {
    const srcFile = path.join(srcDir, entry);
    if (fs.statSync(srcFile).isDirectory()) continue; // 不递归子目录，保持约定简单
    const destFile = path.join(demoDir, entry);
    const ext = path.extname(entry).toLowerCase();
    const raw = fs.readFileSync(srcFile, "utf8");

    let output;
    if (ext === ".html") {
      const protectRelPath = getProtectRelativePath(demoDir);
      const withProtect = ensureProtectScript(raw, protectRelPath);
      output = await compressHtml(withProtect);
    } else if (ext === ".js") {
      output = await compressJs(raw);
    } else if (ext === ".css") {
      output = safeMinifyCss(raw);
    } else {
      // 未知类型原样复制，避免遗漏文件
      output = raw;
    }

    fs.writeFileSync(destFile, output, "utf8");
    report.files.push({
      file: entry,
      srcBytes: Buffer.byteLength(raw, "utf8"),
      outBytes: Buffer.byteLength(output, "utf8"),
    });
  }

  return report;
}

/** 递归查找所有包含 .src 子目录的 demo 目录 */
function findDemoDirs(root) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const hasSrc = entries.some((e) => e.isDirectory() && e.name === ".src");
    if (hasSrc) {
      results.push(dir);
    }
    for (const e of entries) {
      if (e.isDirectory() && e.name !== ".src" && e.name !== SHARED_DIR_NAME) {
        walk(path.join(dir, e.name));
      }
    }
  }
  walk(root);
  return results;
}

async function main() {
  const filter = process.argv[2]; // 可选：只处理路径包含该关键字的 demo

  if (!fs.existsSync(CSSDOODLE_ROOT)) {
    console.error(`未找到目录: ${CSSDOODLE_ROOT}`);
    process.exit(1);
  }

  let demoDirs = findDemoDirs(CSSDOODLE_ROOT);
  if (filter) {
    demoDirs = demoDirs.filter((d) => d.includes(filter));
    if (demoDirs.length === 0) {
      console.error(`未找到匹配 "${filter}" 且包含 .src 目录的 demo`);
      process.exit(1);
    }
  }

  if (demoDirs.length === 0) {
    console.log("没有发现任何包含 .src/ 的 demo 目录，无需处理。");
    return;
  }

  console.log(`发现 ${demoDirs.length} 个待处理 demo：`);
  demoDirs.forEach((d) => console.log(`  - ${path.relative(CSSDOODLE_ROOT, d)}`));
  console.log("");

  for (const demoDir of demoDirs) {
    const report = await processDemoDir(demoDir);
    if (!report) continue;
    console.log(`✔ ${report.dir}`);
    for (const f of report.files) {
      const ratio =
        f.srcBytes > 0 ? Math.round((1 - f.outBytes / f.srcBytes) * 100) : 0;
      console.log(
        `    ${f.file}: ${f.srcBytes}B -> ${f.outBytes}B (压缩 ${ratio}%)`
      );
    }
  }

  console.log("\n全部完成。建议接下来执行 `npm run build` 验证效果。");
}

main().catch((err) => {
  console.error("构建保护脚本执行失败：", err);
  process.exit(1);
});
