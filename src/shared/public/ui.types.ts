// File: src/shared/public/ui.types.ts
// Responsibility: Public UI-facing state contracts and defaults.
// Security: Keeps only presentation-safe settings and actionable user errors.

import type { SupportedExchange, SupportedTheme } from './constants';
import { DEFAULT_QUOTE_CURRENCY } from './constants';

export type AppPage =
  | 'dashboard'
  | 'portfolio'
  | 'trade'
  | 'settings'
  | 'onboarding'
  | 'simulation'
  | 'beta-signup';

export interface UserSettings {
  locale: string;
  theme: SupportedTheme;
  tradingEnabled: boolean;
  aiAutoExecuteEnabled: boolean;
  simulationMode: boolean;
  riskAcknowledged: boolean;
  preferredQuoteCurrency: string;
  notificationsEnabled: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  locale: 'en',
  theme: 'system',
  tradingEnabled: false,
  aiAutoExecuteEnabled: false,
  simulationMode: true,
  riskAcknowledged: false,
  preferredQuoteCurrency: DEFAULT_QUOTE_CURRENCY,
  notificationsEnabled: true
};

export interface LocalizedError {
  title: string;
  message: string;
  actionLabel?: string;
}

export interface BannerMessage {
  id: string;
  tone: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface StoredCredentialStatus {
  exchange: SupportedExchange;
  keyId: string;
  exists: boolean;
  updatedAt?: string;
}

export interface DeleteCredentialResult {
  exchange: SupportedExchange;
  keyId: string;
  deleted: boolean;
}
