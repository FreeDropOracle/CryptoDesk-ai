# IPC Channels

## Exposed Channels

- `market:data.<symbol>`: push market updates to the renderer
- `trade:place`: submit a validated trade request
- `ai:get-signals`: request AI recommendations for a symbol
- `security:save-key`: store a locally encrypted API credential
- `settings:get`: fetch current user settings
- `settings:update`: persist validated settings changes

## Validation Policy

Every invoked channel is backed by a Zod schema in `src/shared/internal/ipc.channels.ts`.

## Security Rules

- Renderer never accesses Node.js directly.
- Renderer never reads raw keychain values.
- Renderer never executes filesystem or child-process operations.
