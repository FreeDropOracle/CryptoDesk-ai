// File: src/renderer/pages/Simulation.tsx
// Responsibility: Hosts the full simulation dashboard experience.
// Security: Keeps all messaging explicit that this workspace is virtual and non-custodial.

import { SimulationDashboard } from './SimulationDashboard';

export const Simulation = (): JSX.Element => {
  return <SimulationDashboard />;
};
