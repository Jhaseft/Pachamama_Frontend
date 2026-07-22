// Traduce las URLs entrantes (deep links) a rutas internas de expo-router.
// Los enlaces que se comparten son:
//   - pachamama://anfitriona/<username>        (custom scheme)
//   - https://monetizalab.vip/@<username>      (universal / app link)
// Ambos deben abrir el handler app/anfitriona-deeplink.tsx, que espera ?username=.
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    let hostname = '';
    let pathname = path;

    // Si llega la URL completa (pachamama://... o https://...), separamos host y path.
    const full = path.match(/^[a-z][a-z0-9+.-]*:\/\/([^/]+)(\/.*)?$/i);
    if (full) {
      hostname = full[1];
      pathname = full[2] || '';
    }

    // pachamama://anfitriona/<username>
    if (hostname === 'anfitriona') {
      const username = decodeURIComponent(pathname.replace(/^\//, ''));
      if (username) return `/anfitriona-deeplink?username=${encodeURIComponent(username)}`;
    }

    // https://monetizalab.vip/@<username>  (o el path suelto /@<username>)
    const at = pathname.match(/^\/@([^/?#]+)/);
    if (at) {
      const username = decodeURIComponent(at[1]);
      return `/anfitriona-deeplink?username=${encodeURIComponent(username)}`;
    }
  } catch {
    // Si algo falla, dejamos que expo-router intente resolver el path tal cual.
  }
  return path;
}
