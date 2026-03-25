// File: src/renderer/utils/error-messages.ts
// Responsibility: Centralizes localized, actionable renderer-safe error copy.
// Security: Prevents raw stack traces from leaking into the UI and keeps messaging intentional.

import type { LocalizedError } from '@shared/public/ui.types';

export type UILanguage = 'en' | 'ar';
export type ErrorInterpolationValues = Readonly<Record<string, string | number>>;

export interface ErrorMessageDefinition {
  title: Readonly<Record<UILanguage, string>>;
  message: Readonly<Record<UILanguage, string>>;
  actionLabel?: Readonly<Record<UILanguage, string>>;
}

const DEFAULT_ACTION_LABEL: Readonly<Record<UILanguage, string>> = {
  en: 'Retry',
  ar: 'إعادة المحاولة'
};

const interpolateMessage = (
  template: string,
  values?: ErrorInterpolationValues
): string => {
  if (values === undefined) {
    return template;
  }

  return Object.entries(values).reduce((message, [key, value]) => {
    return message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
};

const normalizeLocale = (locale?: string): string => {
  if (typeof locale === 'string' && locale.trim().length > 0) {
    return locale.trim().toLowerCase();
  }

  if (typeof navigator !== 'undefined' && navigator.language.trim().length > 0) {
    return navigator.language.trim().toLowerCase();
  }

  return 'en';
};

export const resolveUiLanguage = (locale?: string): UILanguage => {
  return normalizeLocale(locale).startsWith('ar') ? 'ar' : 'en';
};

export const ERROR_MESSAGES = {
  AI: {
    LOAD_SIGNALS: {
      title: {
        en: 'Unable to load AI signals',
        ar: 'تعذر تحميل إشارات الذكاء الاصطناعي'
      },
      message: {
        en: 'Please retry after the advisory engine stabilizes.',
        ar: 'يرجى إعادة المحاولة بعد استقرار محرك التوصيات.'
      }
    },
    ALERT_STREAM: {
      title: {
        en: 'Unable to start live AI alerts',
        ar: 'تعذر تشغيل تنبيهات الذكاء الاصطناعي الحية'
      },
      message: {
        en: 'Refresh the dashboard after the advisory stream reconnects.',
        ar: 'قم بتحديث اللوحة بعد عودة اتصال بث التوصيات.'
      }
    }
  },
  MARKET: {
    SUBSCRIBE_STREAM: {
      title: {
        en: 'Unable to subscribe to market data',
        ar: 'تعذر الاشتراك في بيانات السوق'
      },
      message: {
        en: 'Please retry after the market stream stabilizes.',
        ar: 'يرجى إعادة المحاولة بعد استقرار بث السوق.'
      }
    }
  },
  PORTFOLIO: {
    LOAD_PREVIEW: {
      title: {
        en: 'Unable to load portfolio preview',
        ar: 'تعذر تحميل معاينة المحفظة'
      },
      message: {
        en: 'Please retry after the secure portfolio preview stabilizes.',
        ar: 'يرجى إعادة المحاولة بعد استقرار معاينة المحفظة الآمنة.'
      }
    },
    SUBSCRIBE_PREVIEW: {
      title: {
        en: 'Unable to subscribe to portfolio updates',
        ar: 'تعذر الاشتراك في تحديثات المحفظة'
      },
      message: {
        en: 'Refresh the page after the secure portfolio stream reconnects.',
        ar: 'حدّث الصفحة بعد عودة اتصال بث المحفظة الآمن.'
      }
    }
  },
  SETTINGS: {
    LOAD: {
      title: {
        en: 'Unable to load settings',
        ar: 'تعذر تحميل الإعدادات'
      },
      message: {
        en: 'Please retry in a moment.',
        ar: 'يرجى المحاولة مرة أخرى بعد لحظات.'
      }
    },
    SAVE: {
      title: {
        en: 'Unable to save settings',
        ar: 'تعذر حفظ الإعدادات'
      },
      message: {
        en: 'Review your changes and try again.',
        ar: 'راجع التغييرات ثم حاول مرة أخرى.'
      }
    }
  },
  SECURITY: {
    SAVE_KEY: {
      title: {
        en: 'Unable to save API key',
        ar: 'تعذر حفظ مفتاح API'
      },
      message: {
        en: 'Verify the key details and try again.',
        ar: 'تحقق من بيانات المفتاح ثم حاول مرة أخرى.'
      }
    }
  },
  SIMULATION: {
    LOAD_HISTORY: {
      title: {
        en: 'Unable to load simulation history',
        ar: 'تعذر تحميل سجل المحاكاة'
      },
      message: {
        en: 'Please retry after the local simulation ledger stabilizes.',
        ar: 'يرجى إعادة المحاولة بعد استقرار سجل المحاكاة المحلي.'
      }
    },
    RESET_HISTORY: {
      title: {
        en: 'Unable to reset simulation history',
        ar: 'تعذر إعادة ضبط سجل المحاكاة'
      },
      message: {
        en: 'Please retry after the local ledger finishes the reset request.',
        ar: 'يرجى إعادة المحاولة بعد انتهاء السجل المحلي من طلب إعادة الضبط.'
      }
    }
  },
  TRADING: {
    SUBMIT_ORDER: {
      title: {
        en: 'Unable to place order',
        ar: 'تعذر إرسال الطلب'
      },
      message: {
        en: 'Review the order details and try again.',
        ar: 'راجع تفاصيل الطلب ثم حاول مرة أخرى.'
      }
    }
  }
} as const;

const sanitizeUserFacingMessage = (error: unknown): string | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const message = error.message.trim().replace(/^Error:\s*/i, '');

  if (message.length === 0 || message.length > 180) {
    return null;
  }

  if (message.includes('\n') || message.includes('\r')) {
    return null;
  }

  if (message.includes(' at ') || message.includes('file:') || message.includes('http')) {
    return null;
  }

  return message;
};

export const toLocalizedError = (
  definition: ErrorMessageDefinition,
  error?: unknown,
  options?: {
    locale?: string;
    values?: ErrorInterpolationValues;
    preferSafeRawMessage?: boolean;
  }
): LocalizedError => {
  const language = resolveUiLanguage(options?.locale);
  const fallbackMessage = interpolateMessage(definition.message[language], options?.values);
  const rawMessage =
    options?.preferSafeRawMessage === true ? sanitizeUserFacingMessage(error) : null;

  return {
    title: interpolateMessage(definition.title[language], options?.values),
    message: rawMessage ?? fallbackMessage,
    actionLabel: interpolateMessage(
      definition.actionLabel?.[language] ?? DEFAULT_ACTION_LABEL[language],
      options?.values
    )
  };
};
