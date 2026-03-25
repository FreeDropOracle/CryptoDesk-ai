export interface ToxiproxyProfile {
  name: string;
  latencyMs: number;
  jitterMs: number;
}

export const defaultToxicProfile: ToxiproxyProfile = {
  name: 'market-stream-latency',
  latencyMs: 750,
  jitterMs: 120
};
