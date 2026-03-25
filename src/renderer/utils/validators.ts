// File: src/renderer/utils/validators.ts
// Responsibility: User-input validation helpers for renderer forms.
// Security: Rejects obviously invalid input before it reaches secure IPC handlers.

export { toLocalizedError } from './error-messages';

export const isValidSymbol = (value: string): boolean => {
  return /^[A-Z0-9]+\/[A-Z0-9]+$/.test(value.trim());
};

export const isPositiveNumber = (value: number): boolean => {
  return Number.isFinite(value) && value > 0;
};
