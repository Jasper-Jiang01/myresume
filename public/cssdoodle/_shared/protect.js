/*!
 * 轻量代码保护脚本（仅提高复制门槛，无法做到绝对防护）。
 * 功能：
 *  1. 禁用右键菜单
 *  2. 禁用常见"查看源码/开发者工具"快捷键
 * 说明：所有 cssdoodle demo 页面共用此脚本，通过 <script src="../_shared/protect.js">
 * 引入。若某个 demo 位于更深路径（如 dist 子目录），请相应调整相对路径。
 *
 * 注意：曾经包含过基于 window.outerWidth/innerWidth 差值的 DevTools 打开检测，
 * 但该方法误判率很高（受窗口缩放、系统 DPI、浏览器工具栏等因素影响，会在用户
 * 未打开 DevTools 时也误触发遮罩），且防护收益有限，已移除。
 */
(function () {
  "use strict";

  // ---------- 1. 禁用右键菜单 ----------
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // ---------- 2. 禁用常见查看源码/调试快捷键 ----------
  document.addEventListener("keydown", function (e) {
    const key = e.key ? e.key.toUpperCase() : "";
    const blockedCombos =
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
      (e.metaKey && e.altKey && (key === "I" || key === "J" || key === "C")) || // macOS Cmd+Opt+I/J/C
      (e.ctrlKey && key === "U") ||
      (e.metaKey && key === "U");

    if (blockedCombos) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
})();
