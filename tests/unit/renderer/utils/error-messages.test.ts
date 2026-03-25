/// <reference path="../../../types/jest-globals.d.ts" />

import { ERROR_MESSAGES, resolveUiLanguage, toLocalizedError } from '../../../../src/renderer/utils/error-messages';

describe('error-messages', () => {
  it('resolves Arabic locales safely', () => {
    expect(resolveUiLanguage('ar-TN')).toBe('ar');
    expect(resolveUiLanguage('en-US')).toBe('en');
  });

  it('uses localized fallback copy when raw errors are unsafe', () => {
    const localized = toLocalizedError(
      ERROR_MESSAGES.AI.LOAD_SIGNALS,
      new Error('Error: network timeout\n    at worker.js:12:2')
    );

    expect(localized.title).toBe('Unable to load AI signals');
    expect(localized.message).toBe('Please retry after the advisory engine stabilizes.');
  });

  it('honors an explicit locale over the environment fallback', () => {
    const localized = toLocalizedError(ERROR_MESSAGES.SETTINGS.SAVE, undefined, {
      locale: 'ar'
    });

    expect(localized.title).toBe(ERROR_MESSAGES.SETTINGS.SAVE.title.ar);
    expect(localized.message).toBe(ERROR_MESSAGES.SETTINGS.SAVE.message.ar);
    expect(localized.actionLabel).toBeDefined();
  });

  it('accepts short safe user-facing messages when allowed', () => {
    const localized = toLocalizedError(
      ERROR_MESSAGES.TRADING.SUBMIT_ORDER,
      new Error('Live trading is disabled by feature flag.'),
      {
        preferSafeRawMessage: true
      }
    );

    expect(localized.message).toBe('Live trading is disabled by feature flag.');
  });
});
