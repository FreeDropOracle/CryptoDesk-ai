// File: src/renderer/stores/ui-store.ts
// Responsibility: Tracks lightweight UI state like page selection and banners.
// Security: UI-only state with no privileged side effects.

import { create } from 'zustand';
import type { AppPage, BannerMessage } from '@shared/public/ui.types';

interface UIState {
  currentPage: AppPage;
  banner: BannerMessage | null;
  isSecurityModalOpen: boolean;
  onboardingRiskAcknowledged: boolean;
  setPage(page: AppPage): void;
  setBanner(banner: BannerMessage | null): void;
  setOnboardingRiskAcknowledged(acknowledged: boolean): void;
  openSecurityModal(): void;
  closeSecurityModal(): void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  banner: null,
  isSecurityModalOpen: false,
  onboardingRiskAcknowledged: false,
  setPage: (page: AppPage) => {
    set({ currentPage: page });
  },
  setBanner: (banner: BannerMessage | null) => {
    set({ banner });
  },
  setOnboardingRiskAcknowledged: (acknowledged: boolean) => {
    set({ onboardingRiskAcknowledged: acknowledged });
  },
  openSecurityModal: () => {
    set({ isSecurityModalOpen: true });
  },
  closeSecurityModal: () => {
    set({ isSecurityModalOpen: false });
  }
}));
