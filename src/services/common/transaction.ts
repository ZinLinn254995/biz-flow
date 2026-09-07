/**
 * Transaction port for the service layer.
 *
 * Services must not know about Dexie or the database module (architecture
 * constraint), so atomicity is expressed as an injected capability. The
 * repository layer supplies a Dexie-backed implementation; unit tests that use
 * in-memory mock repositories simply omit it and fall back to direct execution.
 */
export interface TransactionRunner {
  /** Run `work` so that all writes it performs commit or roll back together. */
  run<T>(work: () => Promise<T>): Promise<T>;
}

/** Fallback used when no transactional capability is injected. */
export const directTransactionRunner: TransactionRunner = {
  run: (work) => work(),
};
