/// <reference path="../../../types/jest-globals.d.ts" />

import {
  buildOnboardingSteps,
  canAccessOnboardingStep,
  canAdvanceOnboardingStep
} from '../../../../src/renderer/pages/Onboarding';

describe('Onboarding helpers', () => {
  it('requires risk acknowledgment before advancing beyond the disclaimer step', () => {
    expect(canAdvanceOnboardingStep('disclaimer', false)).toBe(false);
    expect(canAdvanceOnboardingStep('disclaimer', true)).toBe(true);
    expect(canAccessOnboardingStep('security', false)).toBe(false);
    expect(canAccessOnboardingStep('security', true)).toBe(true);
  });

  it('builds bilingual step content', () => {
    const englishSteps = buildOnboardingSteps('en');
    const arabicSteps = buildOnboardingSteps('ar');

    expect(englishSteps[0]?.title).toBe('Welcome');
    expect(arabicSteps[0]?.title).toBe('مرحباً');
    expect(arabicSteps[1]?.title).toBe('إقرار المخاطر');
  });
});
