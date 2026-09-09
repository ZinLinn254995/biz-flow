#!/usr/bin/env node
/**
 * BizFlow — AI continuation state validator.
 *
 * Validates that docs/ai/AI_STATE.json is machine-readable, internally
 * consistent, and consistent with the markdown handoff documentation and the
 * actual repository contents.
 *
 * Exit code 0 = state is usable by the next Coding AI. Non-zero = do not hand off.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEVELOPMENT_STATUSES, collectContinuityDocuments, validateContinuity } from './ai-state-validation.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const read = (rel) => readFileSync(resolve(root, rel), 'utf8');
const has = (rel) => existsSync(resolve(root, rel));

const TASK_STATUSES = ['PLANNED', 'IN_PROGRESS', 'BLOCKED', 'PARTIAL', 'COMPLETE', 'FAILED'];
const VERIFICATION_STATUSES = ['passing', 'failing', 'unknown'];
const CONFIDENCE_VALUES = ['high', 'medium', 'low'];

const REQUIRED_DOCS = [
  'AGENTS.md',
  'docs/ai/AI_START_HERE.md',
  'docs/ai/AI_STATE.json',
  'docs/ai/AI_HANDOFF.md',
  'docs/ai/CURRENT_STATE.md',
  'docs/ai/NEXT_TASK_PROMPT.md',
  'docs/ai/AI_CONTINUATION_PROTOCOL.md',
  'docs/ai/AI_TASK_SELECTION.md',
  'docs/ai/QUALITY_GATE.md',
  'docs/ai/HANDOFF_TEMPLATE.md',
  'docs/ai/PROJECT_CONTEXT.md',
  'docs/ai/ARCHITECTURE.md',
  'docs/ai/ROADMAP.md',
  'docs/ai/DECISIONS.md',
  'docs/ai/KNOWN_ISSUES.md',
  'docs/ai/CHANGELOG.md',
  'docs/ai/GITHUB_SYNC.md',
];

for (const doc of REQUIRED_DOCS) {
  if (!has(doc)) fail(`Required AI documentation file is missing: ${doc}`);
}

let state;
try {
  state = JSON.parse(read('docs/ai/AI_STATE.json'));
} catch (e) {
  console.error(`FAIL AI_STATE.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

const need = (path) =>
  path.split('.').reduce((acc, key) => (acc === undefined || acc === null ? undefined : acc[key]), state);

for (const key of [
  'schemaVersion',
  'project.name',
  'currentMilestone.id',
  'currentMilestone.status',
  'lastCompletedTask',
  'currentTask',
  'progress',
  'quality',
  'architecture',
  'lockedAreas',
  'knownIssues',
  'gitState',
  'lastUpdated',
]) {
  if (need(key) === undefined) fail(`AI_STATE.json is missing required key: ${key}`);
}

const checkStatus = (label, value) => {
  if (value === undefined || value === null) return;
  if (!TASK_STATUSES.includes(value)) {
    fail(`${label} has invalid status "${value}". Allowed: ${TASK_STATUSES.join(', ')}`);
  }
};

checkStatus('currentMilestone.status', need('currentMilestone.status'));
checkStatus('nextTask.status', need('nextTask.status'));
checkStatus('lastCompletedTask.status', need('lastCompletedTask.status'));
checkStatus('currentTask.status', need('currentTask.status'));

for (const [label, task] of [['lastCompletedTask', need('lastCompletedTask')], ['currentTask', need('currentTask')]]) {
  if (!task) continue;
  if (!CONFIDENCE_VALUES.includes(task.confidence)) fail(`${label}.confidence must be high, medium, or low.`);
  if (typeof task.needsHumanReview !== 'boolean') fail(`${label}.needsHumanReview must be boolean.`);
  if (task.needsHumanReview && typeof task.reviewReason !== 'string' || task.needsHumanReview && !task.reviewReason.trim()) fail(`${label}.reviewReason is required when needsHumanReview is true.`);
}

const lastCompleted = need('lastCompletedTask');
if (lastCompleted && lastCompleted.status !== 'COMPLETE') {
  fail('lastCompletedTask.status must be COMPLETE. Use currentTask for unfinished work.');
}

const currentTask = need('currentTask');
if (currentTask && currentTask.status === 'COMPLETE') {
  fail('currentTask.status must not be COMPLETE. Move finished work to lastCompletedTask.');
}

// A task may only be recorded as COMPLETE when verification actually passed.
const quality = need('quality') ?? {};
for (const gate of ['tests', 'typescript', 'productionBuild']) {
  const value = quality[gate];
  if (!value || !VERIFICATION_STATUSES.includes(value.status)) {
    fail(`quality.${gate}.status must be one of: ${VERIFICATION_STATUSES.join(', ')}`);
  }
}
const allGreen = ['tests', 'typescript', 'productionBuild'].every((g) => quality[g]?.status === 'passing');
if (need('currentMilestone.status') === 'COMPLETE' && !allGreen) {
  fail('currentMilestone is COMPLETE but quality gates are not all "passing". Verification must succeed first.');
}

// Referenced files must exist.
const referenced = [];
if (need('nextTask.instructionsFile')) referenced.push(need('nextTask.instructionsFile'));
for (const area of need('lockedAreas') ?? []) referenced.push(area.path);
for (const file of need('lastTaskFilesChanged.modified') ?? []) referenced.push(file);
for (const file of need('lastTaskFilesChanged.created') ?? []) referenced.push(file);

for (const rel of referenced) {
  if (!rel) continue;
  if (!has(rel)) fail(`AI_STATE.json references a path that does not exist: ${rel}`);
}

for (const file of need('lastTaskFilesChanged.deleted') ?? []) {
  if (has(file)) warn(`lastTaskFilesChanged.deleted lists ${file}, but it still exists in the repository.`);
}

// Scope entries that are not deletions should point at real files.
for (const entry of need('nextTaskInstructions.scope') ?? []) {
  const path = String(entry).replace(/\s*\(.*\)\s*$/, '').trim();
  if (!has(path)) fail(`nextTaskInstructions.scope references a missing path: ${path}`);
}

// Known issues must be well formed.
for (const issue of need('knownIssues') ?? []) {
  if (!issue.id || !issue.title || !issue.status) {
    fail(`knownIssues entry is incomplete: ${JSON.stringify(issue)}`);
  }
}

// Cross-document continuity and authorization checks.
const nextId = need('nextTask.id');
const prompt = has('docs/ai/NEXT_TASK_PROMPT.md') ? read('docs/ai/NEXT_TASK_PROMPT.md') : '';
if (nextId) {
  const idParts = nextId.split('+').map((p) => p.trim()).filter(Boolean);
  for (const part of idParts) {
    if (!prompt.includes(part)) fail(`NEXT_TASK_PROMPT.md does not mention next task "${part}".`);
  }
  if (/TODO:\s*decide next task|TBD\s*next task|placeholder/i.test(prompt)) {
    fail('NEXT_TASK_PROMPT.md contains a placeholder instead of a real next task.');
  }
  for (const heading of ['## NEXT TASK', '## OBJECTIVE', '## ACCEPTANCE CRITERIA', '## VERIFICATION COMMANDS']) {
    if (!prompt.includes(heading)) fail(`NEXT_TASK_PROMPT.md is missing the "${heading}" section.`);
  }
}

if (state.developmentStatus !== undefined && !DEVELOPMENT_STATUSES.includes(state.developmentStatus)) {
  fail(`developmentStatus has invalid value "${state.developmentStatus}". Allowed: ${DEVELOPMENT_STATUSES.join(', ')}`);
}

const continuityErrors = validateContinuity({
  state,
  documents: collectContinuityDocuments(read, has),
});
for (const error of continuityErrors) fail(error);

if (!/^\d{4}-\d{2}-\d{2}$/.test(String(need('lastUpdated')))) {
  fail('lastUpdated must be an ISO date (YYYY-MM-DD).');
}

for (const w of warnings) console.warn(`WARN ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`FAIL ${e}`);
  console.error(`\nAI state validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`AI state validation PASSED (${REQUIRED_DOCS.length} docs checked, ${warnings.length} warning(s)).`);
