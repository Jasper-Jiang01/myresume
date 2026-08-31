/**
 * 同域 cssdoodle demo 必须带 allow-same-origin。
 * 只有 allow-scripts 时 iframe 会变成 unique origin，
 * Node 部署下发的 CSP `'self'` 对不上，本站 CSS/JS 会被拦掉。
 */
export const CSSDOODLE_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups";
