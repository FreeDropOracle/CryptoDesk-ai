// File: config/paths.ts
// Responsibility: Centralized filesystem paths used by build and runtime layers.
// Security: Paths stay app-local and avoid writing secrets to public directories.

export const APP_PATHS = {
  logs: 'logs',
  database: 'data/cryptodesk.db',
  models: 'assets/models',
  sounds: 'assets/sounds',
  icons: 'assets/icons'
} as const;
