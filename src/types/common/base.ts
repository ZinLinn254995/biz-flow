/**
 * Branded string type for entity identifiers.
 *
 * Using a branded type (rather than plain `string`) lets the type system
 * distinguish an entity ID from any other string at compile time, preventing
 * accidental cross-assignment (e.g. passing a Sale id where a Customer id is
 * expected). The brand is erased at runtime, so an `EntityId` is just a plain
 * string when serialized or stored.
 */
declare const __entityIdBrand: unique symbol;
export type EntityId = string & { readonly [__entityIdBrand]: true };

/**
 * ISO-8601 timestamp string (e.g. "2026-08-30T12:00:00.000Z").
 *
 * Stored and serialized as a string so values round-trip cleanly through
 * IndexedDB and any future cloud sync layer without timezone ambiguity.
 */
export type ISODateString = string;

/**
 * Fields shared by every domain entity.
 *
 * `id` is a stable, client-generated identifier (UUID or similar) that
 * survives across local and remote storage. `createdAt` / `updatedAt`
 * support future synchronization and conflict detection.
 */
export interface BaseEntity {
  id: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Monetary value representation.
 *
 * Stored as an integer number of minor units (cents) to avoid
 * floating-point rounding errors. For example, $12.34 is stored as 1234.
 * The `currency` field is an ISO 4217 code (e.g. "USD", "EUR").
 * Conversion to/from decimal happens only at the presentation layer.
 */
export interface Money {
  amountMinor: number;
  currency: string;
}
