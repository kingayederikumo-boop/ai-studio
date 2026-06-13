const MAX_PROMPT_LENGTH = 5000;
const MIN_PROMPT_LENGTH = 1;
const PROMPT_PATTERN = /^[a-zA-Z0-9\s.,!?'"()-]+$/; // Basic safe pattern

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePrompt(prompt: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!prompt || typeof prompt !== 'string') {
    errors.push({ field: 'prompt', message: 'Prompt is required and must be a string' });
    return errors;
  }

  const trimmed = prompt.trim();

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    errors.push({ field: 'prompt', message: `Prompt must be at least ${MIN_PROMPT_LENGTH} character` });
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    errors.push({ field: 'prompt', message: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters` });
  }

  // Enforce pattern validation for injection prevention
  if (!PROMPT_PATTERN.test(trimmed)) {
    errors.push({ field: 'prompt', message: 'Prompt contains invalid characters' });
  }

  return errors;
}

export function validateSessionId(sessionId: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!sessionId || typeof sessionId !== 'string') {
    errors.push({ field: 'sessionId', message: 'Session ID must be a string' });
    return errors;
  }

  // Session ID should be alphanumeric with hyphens only
  if (!/^[a-zA-Z0-9\-]+$/.test(sessionId)) {
    errors.push({ field: 'sessionId', message: 'Invalid session ID format' });
  }

  if (sessionId.length > 100) {
    errors.push({ field: 'sessionId', message: 'Session ID is too long' });
  }

  return errors;
}
