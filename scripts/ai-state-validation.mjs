export const DEVELOPMENT_STATUSES = [
  'ACTIVE',
  'PAUSED_AWAITING_INSTRUCTIONS',
  'BLOCKED_ON_HUMAN_DECISION',
];

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

export function extractContinuityFacts(text) {
  return {
    currentMilestone: firstMatch(text, [
      /current milestone\s*\|\s*([^|\n]+)/i,
      /current milestone\s*[:：]\s*([^\n]+)/i,
      /## current milestone\s*\n+([^\n]+)/i,
    ]),
    lastCompletedTask: firstMatch(text, [
      /last completed task\s*[:：]\s*([^\n]+)/i,
      /## last completed task\s*\n+([^\n]+)/i,
    ]),
    nextTask: firstMatch(text, [
      /next task\s*[:：]\s*([^\n]+)/i,
      /## next task\s*\n+([^\n]+)/i,
    ]),
  };
}

export function extractTaskIds(value) {
  return [...String(value ?? '').matchAll(/P(?:2P|3\.\d+)\d*/g)].map((match) => match[0]);
}

export function validateContinuity({ state, documents }) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const status = state.developmentStatus;
  const currentMilestone = state.currentMilestone?.id;
  const lastCompletedTask = state.lastCompletedTask?.id;
  const nextTask = state.nextTask?.id ?? null;
  const facts = Object.fromEntries(
    Object.entries(documents).map(([name, text]) => [name, extractContinuityFacts(text)]),
  );

  if (status !== undefined && !DEVELOPMENT_STATUSES.includes(status)) {
    fail(`developmentStatus has invalid value "${status}". Allowed: ${DEVELOPMENT_STATUSES.join(', ')}`);
  }

  if (!currentMilestone) fail('currentMilestone.id is required for continuity validation.');
  if (!lastCompletedTask) fail('lastCompletedTask.id is required for continuity validation.');

  for (const [name, documentFacts] of Object.entries(facts)) {
    if (currentMilestone && documentFacts.currentMilestone) {
      const ids = extractTaskIds(documentFacts.currentMilestone);
      if (ids.length && !ids.includes(currentMilestone)) {
        fail(`${name} presents current milestone "${ids[0]}" but AI_STATE.json says "${currentMilestone}".`);
      }
    }
    if (lastCompletedTask && documentFacts.lastCompletedTask) {
      const ids = extractTaskIds(documentFacts.lastCompletedTask);
      if (ids.length && !ids.includes(lastCompletedTask)) {
        fail(`${name} presents last completed task "${ids[0]}" but AI_STATE.json says "${lastCompletedTask}".`);
      }
    }
  }

  if (status === 'PAUSED_AWAITING_INSTRUCTIONS') {
    if (nextTask) fail(`Paused development cannot authorize next task "${nextTask}".`);
    for (const [name, documentFacts] of Object.entries(facts)) {
      const nextIds = extractTaskIds(documentFacts.nextTask);
      if (nextIds.length && !/none|wait|paused|await|no task/i.test(documentFacts.nextTask)) {
        fail(`${name} presents active next task "${nextIds[0]}" while developmentStatus is paused.`);
      }
    }
  } else if (nextTask) {
    for (const [name, documentFacts] of Object.entries(facts)) {
      const nextIds = extractTaskIds(documentFacts.nextTask);
      if (nextIds.length && !nextIds.includes(nextTask)) {
        fail(`${name} presents next task "${nextIds[0]}" but AI_STATE.json says "${nextTask}".`);
      }
    }
  }

  return errors;
}

export function collectContinuityDocuments(read, has) {
  return {
    'AI_HANDOFF.md': has('docs/ai/AI_HANDOFF.md') ? read('docs/ai/AI_HANDOFF.md') : '',
    'CURRENT_STATE.md': has('docs/ai/CURRENT_STATE.md') ? read('docs/ai/CURRENT_STATE.md') : '',
  };
}
