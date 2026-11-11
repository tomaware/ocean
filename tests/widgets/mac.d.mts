// Types du banc d'essai du widget Mac (tests seulement).
export function toHtml(n: unknown): string;
export function textOf(html: string): string;
export function load(file: string, settings?: Record<string, string>): Promise<{ mod: any; ran: string[]; store: Record<string, string> }>;
export { h } from 'preact';
