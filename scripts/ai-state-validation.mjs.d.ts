export function extractContinuityFacts(text: string): Record<string, string | string[] | null>;
export function extractTaskIds(value: unknown): string[];
export function validateContinuity(input: { state: unknown; documents: Record<string, string> }): string[];
export function collectContinuityDocuments(read: (path: string) => string, has: (path: string) => boolean): Record<string, string>;
export function validateHandoffArchive(input: { taskId: string; text: string }): string[];
export function handoffArchivePath(taskId: string): string;
export function handoffArchivePaths(taskId: string): string[];
export function requiresHandoffArchive(taskId: string): boolean;
