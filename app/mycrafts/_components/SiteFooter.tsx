/**
 * 底部版权信息
 * 参考 caiguangxi.com 的 footer
 */

export function SiteFooter() {
  return (
    <footer className="mt-16 flex items-center justify-center px-4 py-8 sm:mt-24">
      <p className="text-body text-muted">
        © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
