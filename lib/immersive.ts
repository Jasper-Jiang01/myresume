/** Routes that hide the global site chrome (dots, chat, preference dock). */
export function isImmersivePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/projectDetails") || pathname.startsWith("/website")
  );
}
