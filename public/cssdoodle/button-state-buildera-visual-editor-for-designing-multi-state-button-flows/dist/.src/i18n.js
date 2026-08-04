/**
 * i18n 双语切换：中文默认，点击切换英文。
 * 通过 [data-i18n] key 在 DOM.innterHTML 与字典之间切换；
 * 同时监听父页面 postMessage，便于 iframe 外控制语言。
 */
(function () {
  var dict = {
    zh: {},
    en: {
      "h1": "Button State Builder",
      "hero-eyebrow": "Free tool · No signup",
      "hero-headline":
        'Design button states<br><span class="hero-gradient">that feel alive</span>',
      "hero-sub":
        "Build idle → loading → success → error flows visually.<br>Get production-ready CSS + JS in seconds.",
      "chip-1": "✦ 6 animation types",
      "chip-2": "✦ Gradient builder",
      "chip-3": "✦ Icon + motion",
      "chip-4": "✦ Copy-paste CSS",
      "hero-cta": "See it in action ↓",
      "hero-hint":
        "Every button below is editable — pick one and make it yours.",
    },
  };

  var current = "zh";

  // 启动快锁：DOM 里当前中文写入 dict.zh
  function snapshotZh() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k && !dict.zh[k]) dict.zh[k] = el.innerHTML;
    });
  }

  function applyLang(lang) {
    current = lang;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (k && dict[lang] && dict[lang][k]) el.innerHTML = dict[lang][k];
    });
    var btn = document.getElementById("lang-toggle-btn");
    if (btn) btn.textContent = lang === "zh" ? "EN" : "中";
  }

  window.toggleLang = function () {
    var next = current === "zh" ? "en" : "zh";
    applyLang(next);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "lang", lang: next }, "*");
    }
  };

  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "lang" && e.data.lang && e.data.lang !== current) {
      applyLang(e.data.lang);
    }
  });

  snapshotZh();
})();
