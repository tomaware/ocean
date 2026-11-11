// Types du banc d'essai Scriptable (tests seulement).
export type RunOptions = { family?: string; parameter?: string; inWidget?: boolean; data: unknown; live?: unknown; keychain?: Record<string, string>; alerts?: unknown[]; fail?: boolean; now?: number };
export type RunOutput = { widget: any; presented: any; requests: string[]; keychain: Record<string, string> };
export function run(file: string, opts: RunOptions): Promise<RunOutput>;
export function texts(node: any): string[];
export function urls(node: any): string[];
