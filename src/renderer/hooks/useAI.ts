// File: src/renderer/hooks/useAI.ts
// Responsibility: Backward-compatible alias for advisory AI signal fetching.
// Security: Reuses the same secure preload bridge and advisory-only signal flow.

export { useAISignals as useAI } from './useAISignals';
