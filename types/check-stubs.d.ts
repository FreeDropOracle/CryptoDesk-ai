declare module 'electron' {
  export interface IpcRendererEvent {}

  export interface NativeImage {
    resize(options: { width: number; height: number }): NativeImage;
    isEmpty(): boolean;
  }

  export interface WebContents {
    send(channel: string, data?: unknown): void;
    setWindowOpenHandler(handler: (details: { url: string }) => { action: 'deny' | 'allow' }): void;
    on(
      event: 'will-navigate',
      listener: (event: { preventDefault(): void }, url: string) => void
    ): void;
  }

  export interface BrowserWindowConstructorOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    show?: boolean;
    backgroundColor?: string;
    icon?: string;
    webPreferences?: Record<string, unknown>;
  }

  export class BrowserWindow {
    public constructor(options?: BrowserWindowConstructorOptions);
    public static getAllWindows(): BrowserWindow[];
    public webContents: WebContents;
    public loadURL(url: string): Promise<void>;
    public loadFile(filePath: string): Promise<void>;
    public once(event: 'ready-to-show', listener: () => void): void;
    public on(event: 'closed', listener: () => void): void;
    public show(): void;
    public hide(): void;
    public focus(): void;
    public isVisible(): boolean;
  }

  export interface MenuItemConstructorOptions {
    label?: string;
    type?: 'separator';
    click?: () => void;
  }

  export class Menu {
    public static buildFromTemplate(template: MenuItemConstructorOptions[]): Menu;
  }

  export class Tray {
    public constructor(image: NativeImage | string);
    public setToolTip(toolTip: string): void;
    public setContextMenu(menu: Menu): void;
    public on(event: 'click', listener: () => void): void;
  }

  export const app: {
    isReady(): boolean;
    getPath(name: string): string;
    getAppPath(): string;
    whenReady(): Promise<void>;
    quit(): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
  };

  export const contextBridge: {
    exposeInMainWorld(key: string, api: Record<string, unknown>): void;
  };

  export const ipcRenderer: {
    on<T>(
      channel: string,
      listener: (event: IpcRendererEvent, data: T) => void
    ): void;
    removeListener<T>(
      channel: string,
      listener: (event: IpcRendererEvent, data: T) => void
    ): void;
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  };

  export const safeStorage: {
    isEncryptionAvailable(): boolean;
    encryptString(value: string): Buffer;
    decryptString(value: Buffer): string;
  };

  export const session: {
    defaultSession: {
      setPermissionRequestHandler(
        handler: (
          webContents: WebContents,
          permission: string,
          callback: (allowed: boolean) => void
        ) => void
      ): void;
    };
  };

  export const shell: {
    openExternal(url: string): Promise<void>;
  };

  export const nativeImage: {
    createFromPath(path: string): NativeImage;
  };
}

declare module 'zod' {
  type InferSchema<T extends ZodType<unknown>> = T extends ZodType<infer U> ? U : never;
  type RequiredObjectKeys<T extends Record<string, ZodType<unknown>>> = {
    [K in keyof T]-?: undefined extends InferSchema<T[K]> ? never : K;
  }[keyof T];
  type OptionalObjectKeys<T extends Record<string, ZodType<unknown>>> = {
    [K in keyof T]-?: undefined extends InferSchema<T[K]> ? K : never;
  }[keyof T];
  type InferObjectShape<T extends Record<string, ZodType<unknown>>> = {
    [K in RequiredObjectKeys<T>]: InferSchema<T[K]>;
  } & {
    [K in OptionalObjectKeys<T>]?: Exclude<InferSchema<T[K]>, undefined>;
  };

  export class ZodError<T = unknown> extends Error {
    public issues: Array<{
      message: string;
      path?: Array<string | number>;
    }>;
  }

  export interface ZodType<T = unknown> {
    parse(input: unknown): T;
    safeParse(
      input: unknown
    ):
      | {
          success: true;
          data: T;
        }
      | {
          success: false;
          error: ZodError<T>;
        };
    optional(): ZodType<T | undefined>;
    min(value: number, message?: string): ZodType<T>;
    max(value: number, message?: string): ZodType<T>;
    regex(value: RegExp, message?: string): ZodType<T>;
    positive(): ZodType<T>;
    finite(): ZodType<T>;
    strict(): ZodType<T>;
    partial(): ZodType<T>;
    default(value: T): ZodType<T>;
    nullable(): ZodType<T | null>;
    url(message?: string): ZodType<T>;
    int(): ZodType<T>;
    superRefine(
      callback: (
        value: T,
        context: {
          addIssue(issue: {
            code: string;
            path?: string[];
            message: string;
          }): void;
        }
      ) => void
    ): ZodType<T>;
  }

  interface ZodStatic {
    string(): ZodType<string>;
    number(): ZodType<number>;
    boolean(): ZodType<boolean>;
    undefined(): ZodType<undefined>;
    array<T>(schema: ZodType<T>): ZodType<T[]>;
    object<T extends Record<string, ZodType<unknown>>>(
      shape: T
    ): ZodType<InferObjectShape<T>>;
    enum<T extends readonly [string, ...string[]]>(values: T): ZodType<T[number]>;
    coerce: {
      number(): ZodType<number>;
      boolean(): ZodType<boolean>;
    };
    ZodIssueCode: {
      custom: 'custom';
    };
  }

  export const z: ZodStatic;

  export namespace z {
    export type infer<T extends ZodType<unknown>> = T extends ZodType<infer U> ? U : never;
  }
}

declare module 'keytar' {
  const keytar: {
    setPassword(service: string, account: string, secret: string): Promise<void>;
    getPassword(service: string, account: string): Promise<string | null>;
    deletePassword(service: string, account: string): Promise<boolean>;
  };

  export default keytar;
}

declare module 'better-sqlite3' {
  export namespace Database {
    interface RunResult {
      changes: number;
    }

    interface Statement<TResult = unknown> {
      run(parameters?: Record<string, unknown> | unknown): RunResult;
      get(parameters?: Record<string, unknown> | unknown): TResult | undefined;
      all(parameters?: Record<string, unknown> | unknown): TResult[];
    }

    interface Database {
      prepare(sql: string): Statement;
      exec(sql: string): void;
      pragma(value: string): void;
      transaction<T>(operation: () => T): () => T;
    }
  }

  class BetterSqlite3Database implements Database.Database {
    public constructor(path: string);
    public prepare(sql: string): Database.Statement;
    public exec(sql: string): void;
    public pragma(value: string): void;
    public transaction<T>(operation: () => T): () => T;
  }

  export default BetterSqlite3Database;
}

declare module 'ccxt' {
  class BinanceExchange {
    public constructor(options?: Record<string, unknown>);
    public fetchTicker(symbol: string): Promise<Record<string, unknown>>;
    public fetchBalance(): Promise<Record<string, unknown>>;
    public setSandboxMode(enabled: boolean): void;
  }

  class BybitExchange {
    public constructor(options?: Record<string, unknown>);
    public fetchTicker(symbol: string): Promise<Record<string, unknown>>;
    public fetchBalance(): Promise<Record<string, unknown>>;
    public setSandboxMode(enabled: boolean): void;
  }

  const ccxt: {
    binance: typeof BinanceExchange;
    bybit: typeof BybitExchange;
  };

  export default ccxt;
}

declare module 'onnxruntime-node' {
  export const InferenceSession: {
    create(modelPath: string): Promise<unknown>;
  };
}

declare module 'winston' {
  import type Transport from 'winston-transport';

  export interface Logger {
    info(message: string, context?: unknown): void;
    warn(message: string, context?: unknown): void;
    error(message: string, context?: unknown): void;
  }

  export const format: {
    combine(...formats: unknown[]): unknown;
    timestamp(): unknown;
    errors(options?: { stack?: boolean }): unknown;
    json(): unknown;
  };

  export const transports: {
    File: new (options: { filename: string; level: string }) => Transport;
    Console: new (options?: { level?: string }) => Transport;
  };

  export function createLogger(options: {
    level: string;
    format: unknown;
    transports: Transport[];
  }): Logger;
}

declare module 'winston-transport' {
  export default class Transport {
    public constructor(options?: Record<string, unknown>);
  }
}

declare module 'react' {
  export type ReactNode = unknown;

  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export interface HTMLAttributes<T> {
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
    onClick?: (event: unknown) => void;
  }

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }

  export type PropsWithChildren<P = {}> = P & {
    children?: ReactNode;
  };

  export interface MutableRefObject<T> {
    current: T;
  }

  export interface SyntheticEvent<T = Element> {
    target: T;
    currentTarget: T;
    preventDefault(): void;
  }

  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}

  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly unknown[]
  ): void;

  export function useState<S>(
    initialState: S | (() => S)
  ): [S, (nextState: S | ((previousState: S) => S)) => void];

  export function useRef<T>(initialValue: T): MutableRefObject<T>;

  const React: {
    StrictMode: (props: PropsWithChildren) => JSX.Element;
  };

  export default React;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export const Fragment: unique symbol;
}

declare module 'zustand' {
  type StateUpdater<T> =
    | T
    | Partial<T>
    | ((state: T) => T | Partial<T>);

  export interface StoreApi<T> {
    getState(): T;
    setState(nextState: StateUpdater<T>, replace?: boolean): void;
    subscribe(listener: (state: T, previousState: T) => void): () => void;
  }

  export type StateCreator<T> = (
    set: (nextState: StateUpdater<T>, replace?: boolean) => void,
    get: () => T
  ) => T;

  export type UseBoundStore<T> = (<U>(selector: (state: T) => U) => U) & StoreApi<T>;

  export function create<T>(initializer: StateCreator<T>): UseBoundStore<T>;
}

declare module 'lightweight-charts' {
  export const ColorType: {
    Solid: 'solid';
  };

  export type UTCTimestamp = number;

  export interface LineData {
    time: UTCTimestamp;
    value: number;
  }

  export interface LineSeriesApi {
    setData(data: readonly LineData[]): void;
  }

  export interface IChartApi {
    addLineSeries(options?: Record<string, unknown>): LineSeriesApi;
    remove(): void;
  }

  export function createChart(
    container: unknown,
    options?: Record<string, unknown>
  ): IChartApi;
}

declare namespace JSX {
  interface Element {}

  interface IntrinsicAttributes {
    key?: string | number;
  }

  interface IntrinsicElements {
    [elementName: string]: Record<string, unknown>;
  }
}
