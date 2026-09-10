export const DECISION_STATUSES = ['CURRENT', 'SUPERSEDED', 'HISTORICAL'];
export const REQUIRED_DECISION_HEADINGS = [
  'DECISION ID',
  'TASK / MILESTONE',
  'DECISION',
  'CONTEXT / PROBLEM',
  'RATIONALE',
  'CONSEQUENCES / TRADE-OFFS',
  'STATUS',
];

const section = (text, heading) => {
  const lines = String(text ?? '').split(/\r?\n/);
  const target = heading.trim().toLowerCase();
  const start = lines.findIndex((line) => line.replace(/^#+\s*/, '').trim().toLowerCase() === target);
  if (start < 0) return '';
  const end = lines.slice(start + 1).findIndex((line) => /^#+\s+/.test(line));
  return lines.slice(start + 1, end < 0 ? lines.length : start + 1 + end).join('\n').trim();
};

export function parseTaskDecision(text) {
  const content = String(text ?? '').trim();
  return {
    id: section(content, 'DECISION ID'),
    task: section(content, 'TASK / MILESTONE'),
    decision: section(content, 'DECISION'),
    context: section(content, 'CONTEXT / PROBLEM'),
    rationale: section(content, 'RATIONALE'),
    alternatives: section(content, 'ALTERNATIVES CONSIDERED'),
    consequences: section(content, 'CONSEQUENCES / TRADE-OFFS'),
    status: section(content, 'STATUS'),
  };
}

export function validateTaskDecision({ text, knownTaskIds = [], source = 'decision record' }) {
  const errors = [];
  const record = parseTaskDecision(text);
  const fail = (message) => errors.push(`${source}: ${message}`);
  if (!String(text ?? '').trim()) return [`${source}: decision record is empty.`];
  if (!/^DEC-[A-Z0-9][A-Z0-9._-]*$/i.test(record.id)) fail('decision ID must use the DEC- prefix.');
  if (!record.task) fail('task / milestone is required.');
  if (!record.decision) fail('decision is required and cannot be empty.');
  if (!record.context) fail('context / problem is required and cannot be empty.');
  if (!record.rationale) fail('rationale is required and cannot be empty.');
  if (!record.consequences) fail('consequences / trade-offs is required and cannot be empty.');
  if (!DECISION_STATUSES.includes(record.status.toUpperCase())) fail(`status must be one of: ${DECISION_STATUSES.join(', ')}.`);
  const taskIds = [...record.task.matchAll(/(?:P4\.\d+|P3\.\d+|P2P\d+)/gi)].map((match) => match[0].toUpperCase());
  if (!taskIds.length) fail('task / milestone must name a task or milestone ID.');
  if (knownTaskIds.length && taskIds.some((id) => !knownTaskIds.includes(id))) {
    fail(`task / milestone references an unknown task: ${taskIds.find((id) => !knownTaskIds.includes(id))}.`);
  }
  return errors;
}

export function validateTaskDecisions({ records, knownTaskIds = [] }) {
  const errors = [];
  const ids = new Map();
  for (const record of records) {
    const parsed = parseTaskDecision(record.text);
    errors.push(...validateTaskDecision({ text: record.text, knownTaskIds, source: record.path }));
    if (parsed.id) {
      if (ids.has(parsed.id)) errors.push(`Duplicate decision ID "${parsed.id}" in ${ids.get(parsed.id)} and ${record.path}.`);
      else ids.set(parsed.id, record.path);
    }
  }
  return { errors, ids };
}

export function extractDecisionIds(text) {
  return [...String(text ?? '').matchAll(/DEC-[A-Z0-9][A-Z0-9._-]*/gi)].map((match) => match[0].replace(/\.MD$/i, '').toUpperCase());
}

export function validateDecisionReferences({ text, knownDecisionIds, source = 'handoff' }) {
  return extractDecisionIds(text)
    .filter((id) => !knownDecisionIds.has(id))
    .map((id) => `${source}: references non-existent decision ID "${id}".`);
}
