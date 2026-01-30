export function expandPrompt(userPrompt: string, hasReference: boolean): string {
  if (!userPrompt.trim()) {
    return "";
  }

  if (hasReference) {
    return `Transform the reference content with the following creative direction: ${userPrompt}`;
  }

  return `Create a cinematic short-form video: ${userPrompt}. Include dynamic camera movement, professional lighting, and engaging composition.`;
}
