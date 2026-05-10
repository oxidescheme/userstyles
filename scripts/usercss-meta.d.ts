declare module "usercss-meta" {
  interface ParseResult {
    metadata: Record<string, unknown>;
  }
  export function parse(
    source: string,
    options?: { allowUnknown?: boolean },
  ): ParseResult;
}