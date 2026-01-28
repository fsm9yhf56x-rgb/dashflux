// lib/changelogVersion.ts

const CHANGELOG_VERSION = 'v2.0.0';
const STORAGE_KEY = `changelog-${CHANGELOG_VERSION}-seen`;

export function hasSeenChangelog(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markChangelogAsSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'true');
}

export function resetChangelog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentVersion(): string {
  return CHANGELOG_VERSION;
}