export function buildPrompt(template: string, inputs: Record<string, any>): string {
  let prompt = template;
  for (const [key, value] of Object.entries(inputs)) {
    // Replace all occurrences of {{key}} with the value securely
    const regex = new RegExp(`{{${key}}}`, 'g');
    prompt = prompt.replace(regex, String(value));
  }
  return prompt;
}
