# BizFlow — Future AI Direction

> **Status:** FUTURE_DIRECTION_ONLY — not implemented, not authorized, not started.
> This document describes a planned product and architecture direction. It is NOT a task prompt.
> No AI code, OpenRouter integration, API keys, environment variables, database tables, or SDKs
> have been added. The current BizFlow application behaves exactly as before.

## Purpose

This document ensures that any future Coding AI, Prompt Generator AI, developer, or agent
that reads the repository can understand the planned AI direction without access to prior
conversations.

A new AI that has never seen the previous conversation must be able to understand:

- Why BizFlow will use AI
- What AI will eventually do
- What AI will NOT do
- How the Dashboard will eventually work
- How AI will interact with existing BizFlow data
- Why tools are required
- Why the database remains the source of truth
- How token cost will be minimized
- Why OpenRouter is planned
- What the future roadmap is
- That none of this is being implemented yet

---

## 1. Why AI

BizFlow is currently a financial/business record management application. Users interact
through forms and UI controls. In the future, BizFlow will evolve toward an
**AI-Assisted Financial Record Management System** that allows users to interact with their
existing financial data through natural language and other convenient input methods.

This is a **future direction**. Do not build it now.

---

## 2. Core Future Product Idea

The future BizFlow should support multiple ways of interacting with financial data:

1. Use the existing normal UI/forms
2. Type natural-language instructions
3. Speak using voice
4. Take a photo of a receipt
5. Eventually import data from sources such as Excel/CSV/bank data

All of these methods must ultimately interact with the **same BizFlow financial data system**.
There is no separate AI-only financial ledger. The existing BizFlow database/data model
remains the source of truth.

```
User
  → Normal UI OR AI
  → BizFlow controlled data operations
  → Existing data layer
  → Database
  → Dashboard / Reports / AI response
```

---

## 3. Future Dashboard Direction

When the future AI system is eventually implemented, the Dashboard should become the main
place where users can both **see** their financial data and **talk to** their financial data.

The Dashboard should NOT become a chat-only screen. It should contain both:

### AI Interaction Area

A prominent area where users can eventually:

- Record data
- Ask questions
- Search records
- Edit records
- Correct records
- Request summaries
- Interact using text
- Interact using voice
- Submit receipt/photos

Example interactions (Burmese):

- «"ဒီနေ့ အရောင်း ၃၅၀၀ ဘတ် မှတ်ထား"» — record today's sale of 3500 baht
- «"ဒီနေ့ ဆီ ၅၀၀ ဘတ် ဝယ်တယ်"» — record today's fuel purchase of 500 baht
- «"ဒီလ အရောင်းအများဆုံးနေ့က ဘယ်နေ့လဲ?"» — which day had the most sales this month?
- «"မနေ့က ဆီဝယ်ထားတဲ့စာရင်း ပြပါ"» — show yesterday's fuel purchase records
- «"အဲဒီ expense ကို ၆၀၀ ဘတ်အဖြစ်ပြင်ပါ"» — correct that expense to 600 baht

### Financial Data Overview

The Dashboard should continue to show normal BizFlow financial information such as:

- Today's income
- Today's expenses
- Net result
- Monthly income
- Monthly expenses
- Monthly net result
- Sales trends
- Expense categories
- Recent transactions
- Existing reports/metrics

**The future Dashboard concept is: Dashboard + AI Interaction + Financial Overview — not an
AI Chat Page only.**

---

## 4. AI as an Interaction Layer

This is a fundamental architectural principle.

- AI should NOT become the owner of BizFlow's financial data.
- AI should NOT maintain a separate ledger.
- AI should understand what the user wants and then interact with the existing BizFlow system
  through controlled operations.

Example:

```
User: «"ဒီနေ့ ကြက်သား ၈၀၀ ဘတ်ဝယ်တယ်"» ("I bought chicken for 800 baht today")

AI understands:
  operation: create_expense
  amount: 800
  description: chicken
  date: today

AI uses an approved BizFlow operation to create the record.

The resulting record is a normal BizFlow financial record.
It appears in the same Dashboard, transaction lists, reports, and summaries
as records entered through the normal UI.
```

---

## 5. Future Tool-Based Architecture

A major future design principle is that AI should use **predefined BizFlow tools** rather
than receiving unrestricted access to the database.

```
User
  → AI
  → Understand Intent
  → Select Appropriate Tool
  → BizFlow Tool
  → Existing Data Layer
  → Database
  → Small Structured Result
  → AI
  → User
```

- AI should NOT simply receive the entire database and attempt to reason over all records.
- AI should NOT have unrestricted direct database access.
- AI should NOT be the primary place where financial calculations are performed.
- The database/application layer should perform data operations and calculations whenever
  possible.

---

## 6. Future Tool Categories

When AI implementation eventually begins, the project may need controlled tools such as:

### Recording

- `create_sale`
- `create_income`
- `create_expense`
- `create_transfer`

### Searching

- `search_transactions`
- `get_transaction`
- `find_transactions_by_date`
- `find_transactions_by_category`

### Summaries

- `get_today_summary`
- `get_month_summary`
- `get_profit_summary`
- `get_best_sales_day`
- `get_expense_by_category`
- `get_sales_summary`

### Editing

- `update_transaction`
- `delete_transaction`

These are **future planning examples only**. Do NOT create or implement these tools now.
When implementation eventually begins, the actual tools must be based on the current BizFlow
data model and architecture at that time.

---

## 7. Example: Asking About Existing Data

Suppose the user eventually asks:

«"ဒီလ အရောင်းအများဆုံးနေ့က ဘယ်နေ့လဲ?"» ("Which day had the most sales this month?")

The future architecture should work approximately like this:

```
User question
  ↓
AI understands intent
  ↓
AI selects appropriate BizFlow tool (e.g., get_best_sales_day)
  ↓
Tool queries existing BizFlow data
  ↓
Database performs the required calculation
  ↓
Tool returns only the required result
  ↓
AI explains the result to the user
```

For example, the tool might return:

```json
{
  "date": "2026-09-07",
  "sales": 8450
}
```

The AI can then answer naturally. The entire transaction history does NOT need to be sent
to the AI.

---

## 8. Token Cost Optimization

Cost efficiency is an important future design goal. The future AI system should minimize
unnecessary token usage.

Planned strategy:

- Do not send the entire database to the model.
- Do not send large transaction histories when a database query can answer the question.
- Use predefined tools for common operations.
- Let the database/application layer perform calculations.
- Return small structured results to the AI.
- Keep AI context limited to what is actually needed.
- Use fast/cost-efficient models for simple operations.
- Use stronger models only when necessary.
- Keep the AI model/provider configurable.

**Core principle:**

| Layer | Responsibility |
|-------|---------------|
| Database | Does the data work |
| Tools | Do the application work |
| AI | Does the language understanding and user interaction work |

---

## 9. Future OpenRouter Strategy

The future BizFlow AI system is intended to use **OpenRouter** as the AI model gateway.

However, this is only a future architecture decision.

- Do NOT integrate OpenRouter now.
- Do NOT add API keys now.
- Do NOT add environment variables now.
- Do NOT add AI SDKs now.

The future architecture should avoid being permanently dependent on one specific AI model.
The model should eventually be configurable so BizFlow can evaluate models based on:

| Criterion | Description |
|-----------|-------------|
| Cost | Token pricing |
| Speed | Response latency |
| Tool calling | Structured function/tool invocation |
| Structured output | JSON mode reliability |
| Reliability | Uptime and consistency |
| Burmese language support | မြန်မာဘာသာ |
| Thai language support | ภาษาไทย |
| English language support | English |
| Vision/multimodal capability | Receipt/photo understanding |
| Reasoning quality | Complex intent parsing |

---

## 10. Future AI Capabilities Roadmap

The planned AI roadmap includes these phases of capability:

| Phase | Capability |
|-------|------------|
| 1 | AI Record / Data Entry |
| 2 | AI Search |
| 3 | AI Edit / Correction |
| 4 | AI Categorization |
| 5 | Voice Input |
| 6 | Receipt / Photo Input |
| 7 | AI Reports / Summaries |
| 8 | Data Pattern Understanding |

Advanced AI financial assistance may be considered later.

The current planned direction is primarily **AI-Assisted Financial Record Management**,
not AI Financial Advisor.

---

## 11. Receipt / Photo Direction

In the future, BizFlow may allow users to take a photo of a receipt.

```
Receipt Photo
  ↓
AI Vision / OCR
  ↓
Extract information
  ↓
Create structured transaction preview
  ↓
User confirms
  ↓
BizFlow controlled operation
  ↓
Existing database
  ↓
Normal BizFlow Dashboard / Records
```

Potential information to extract:

- Date
- Merchant
- Items
- Quantity
- Amount
- Total
- Category

This is future functionality only. Do NOT implement it now.

---

## 12. Accuracy and Reliability Principles

Future AI implementation must follow these principles:

1. **Never invent financial records.** Never invent amounts, dates, sales, expenses, or profits.
2. **Never guess when important information is ambiguous.** Ask the user for clarification.
3. **Do not bypass existing BizFlow business rules.** Use the same validation and constraints
   as the normal UI.
4. **Do not give the model unrestricted database access.** Use controlled application
   operations.
5. **Preserve one source of truth.** All records — whether from manual entry or AI — are
   normal BizFlow records in the same database.
6. **Use confirmation where appropriate** for potentially destructive actions (e.g., deleting
   a transaction, editing an amount).
7. **Prefer actual BizFlow data over AI assumptions.** When the user asks a question, query
   the database — do not let the AI guess the answer.

---

## 13. Future Input Architecture

The long-term concept:

```
Manual Form
Text
Voice
Receipt Photo
Future Imports (Excel/CSV/Bank)
      ↓
Same BizFlow Data Model
      ↓
Same Data Layer
      ↓
Same Database
      ↓
Dashboard / Reports / AI
```

The input source may eventually be tracked as metadata, for example:

- `manual`
- `ai_text`
- `ai_voice`
- `receipt`

But the resulting transaction should remain a normal BizFlow transaction.

---

## 14. Important Future Development Rule

This documentation is a **future roadmap and architectural direction**. It is NOT a command
to implement all of these features.

Any future Coding AI working on BizFlow must:

1. Read this documentation.
2. Inspect the current repository.
3. Understand what is already implemented.
4. Determine the current architecture before making changes.
5. Avoid duplicating existing functionality.
6. Follow existing architectural constraints (see `AGENTS.md` section G and
   `docs/ai/ARCHITECTURE.md`).
7. Implement only the specific task that is explicitly authorized.
8. Treat this document as product/architecture guidance.
9. Not assume that every planned feature is already implemented.
10. Verify the project after any future implementation.

**The current repository implementation always represents the actual current state.**
**This documentation represents the intended future AI direction.**

---

## 15. Relationship to Existing Architecture

The future AI direction builds on the existing BizFlow architecture, not against it:

| Existing Layer | Future AI Role |
|----------------|----------------|
| UI (pages/components) | Dashboard gains an AI interaction area alongside existing financial overview |
| React Hooks | New hooks may wrap AI tool calls, following the existing `useAsync`/`useMutation` pattern |
| Application Services | AI tools call existing services (e.g., `SalesService.createSale`), not the database directly |
| Repository Interfaces | Unchanged — AI tools use the same service-layer entry points as the normal UI |
| Dexie/IndexedDB | Unchanged — remains the single source of truth |

The existing 5-layer architecture, dependency direction rules, locked areas, money
precision rules, and architecture constraint tests all remain in force. Any future AI
implementation must pass `npm run verify` including all constraint tests.

---

## 16. What This Document Is NOT

- It is NOT an implementation task prompt.
- It is NOT authorization to start building AI features.
- It is NOT a replacement for `NEXT_TASK_PROMPT.md`.
- It is NOT a decision to add OpenRouter, API keys, or AI SDKs.
- It is NOT a change to the existing data model, database schema, services, or UI.
- It is NOT a change to any existing application behavior.

**No AI code has been added. No OpenRouter integration has been added. No API keys or
environment variables have been added. No database tables for AI have been added.
The current BizFlow application behaves exactly as it did before this document was written.**
