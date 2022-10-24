export type LiteralSwitch<T> = {
  [key: string]: T;
  default: T;
};

export function literalSwitch<
  T,
  K extends Exclude<keyof LiteralSwitch<T>, never>,
>(options: LiteralSwitch<T>, key: K): T {
  return options[key] || options.default;
}
