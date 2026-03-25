declare namespace jest {
  interface Mock<TArgs extends unknown[] = unknown[], TReturn = unknown> {
    (...args: TArgs): TReturn;
  }

  function fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
    implementation?: (...args: TArgs) => TReturn
  ): Mock<TArgs, TReturn>;

  function mock(
    moduleName: string,
    factory?: () => Record<string, unknown>
  ): void;
}

declare function describe(
  name: string,
  suite: () => void
): void;

declare function it(
  name: string,
  test: () => void | Promise<void>
): void;

declare function expect<T>(value: T): {
  toBe(expected: unknown): void;
  toContain(expected: unknown): void;
  toMatch(expected: RegExp): void;
  toBeInstanceOf(expected: new (...args: never[]) => object): void;
  resolves: {
    toBe(expected: unknown): Promise<void>;
  };
  rejects: {
    toBeInstanceOf(expected: new (...args: never[]) => object): Promise<void>;
  };
};
