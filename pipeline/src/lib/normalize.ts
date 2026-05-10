export function normalize(expression: string): string {
  return expression.trim().toLowerCase().replace(/\s+/g, " ");
}
