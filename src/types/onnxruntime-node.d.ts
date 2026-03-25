// File: src/types/onnxruntime-node.d.ts
// Responsibility: Minimal local typing for ONNX Runtime until upstream typings are available in this environment.
// Security: Keeps model loading typed without widening privileged boundaries.

declare module 'onnxruntime-node' {
  export interface InferenceSessionType {
    readonly inputNames?: readonly string[];
    readonly outputNames?: readonly string[];
  }

  export const InferenceSession: {
    create(modelPath: string): Promise<InferenceSessionType>;
  };
}
