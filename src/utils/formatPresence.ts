/**
 * Converts lastActiveAt + isOnline into a human-readable relative presence string.
 *
 * Rules (no exact times, only relative ranges):
 *   isOnline = true                       → "En línea"
 *   lastActiveAt < 2 min ago              → "Activo recientemente"  (avoids "hace 0 min" / "hace 1 min")
 *   lastActiveAt < 60 min ago             → "Activo hace X min"
 *   lastActiveAt < 24 h ago              → "Activo hace X h"
 *   lastActiveAt < 7 days ago             → "Activo recientemente"
 *   older than 7 days or no data          → null
 */
export function formatPresence(
  isOnline: boolean,
  lastActiveAt?: string | null,
): string | null {
  if (isOnline) return 'En línea';

  if (!lastActiveAt) return null;

  const diffMs = Date.now() - new Date(lastActiveAt).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 2) return 'Activo recientemente';
  if (diffMin < 60) return `Activo hace ${diffMin} min`;
  if (diffH < 24) return `Activo hace ${diffH} h`;
  if (diffDays < 7) return 'Activo recientemente';

  return null;
}
