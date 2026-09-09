export const DEVELOPMENT_STATUSES = [
  'ACTIVE',
  'PAUSED_AWAITING_INSTRUCTIONS',
  'BLOCKED_ON_HUMAN_DECISION',
];

export const HANDOFF_REQUIRED_HEADINGS = [
  'TASK ID',
  'OBJECTIVE',
  'WHAT WAS CHANGED',
  'FILES CHANGED',
  'RATIONALE',
  'VERIFICATION',
  'KNOWN ISSUES',
  'REMAINING WORK',
  'NEXT TASK',
  'RESTRICTIONS',
  'GIT STATE',
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

export function validateHandoffArchive({ taskId, text }) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const content = String(text ?? '').trim();

  if (!content) {
    fail(`Handoff archive for ${taskId} is empty.`.replace('empty', 'empty'));
    return errors;
  }

  const taskIdMatch = content.match(/(?:task id|task identity)\s*[:：-]\s*(?:[*`_\s]|\[[^\]]*\])*([A-Za-z0-9._-]+)/i)
    ?? content.match(/(?:^|\n)#+\s*(?:task id|task identity)\s*\n+\s*([A-Za-z0-9._-]+)/i);
  if (!taskIdMatch || taskIdMatch[1] !== taskId) {
    fail(`Handoff archive task identity does not match ${taskId}.`);
  }

  for (const heading of HANDOFF_REQUIRED_HEADINGS) {
    const headingPattern = new RegExp(`(?:^|\\n)#+\\s*(?:${heading.replace(/ /g, '\\s+')})(?:\\s|$)`, 'i');
    if (!headingPattern.test(content)) {
      fail(`Handoff archive for ${taskId} is missing required section "${heading}".`);
    }
  }

  return errors;
}

export function handoffArchivePath(taskId) {
  return `docs/ai/handoffs/${String(taskId).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-handoff.md`;
}

export function handoffArchivePaths(taskId) {
  const canonical = handoffArchivePath(taskId);
  if (String(taskId).toUpperCase() === 'P3.1') {
    return [canonical, 'docs/ai/handoffs/P3.1-state-handoff-consistency.md'];
  }
  return [canonical];
}

export function requiresHandoffArchive(taskId) {
  return /^P3\.\d+$/i.test(String(taskId ?? ''));
}
