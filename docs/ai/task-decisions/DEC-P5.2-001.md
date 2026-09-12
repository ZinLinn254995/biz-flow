# DEC-P5.2-001 — Generic Item Compatibility Foundation

Status: accepted and implemented.

P5.2 preserves the persisted `InventoryItem` model and introduces `GenericItem` as a compatibility projection. Stock, pricing, and inventory behavior remain inventory-specific. The adapter is one-way, reuses the existing identity/name boundary, and does not add a category association table or Dexie migration. Saved Items, Quick Items, Favorites, Quick Add, Purchases, accounts, sync, and cloud persistence remain out of scope.

Compatibility impact: Sales and Backup continue to use `InventoryItem` unchanged; Dexie remains version 1 with no schema or index changes.
