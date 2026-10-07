import type { Money } from '@/types/common/base';

export type KnownCost = { kind: 'known'; value: Money; provenance?: string };
export type UnknownCost = { kind: 'unknown'; reason?: string };
export type CostAtSale = KnownCost | UnknownCost;
