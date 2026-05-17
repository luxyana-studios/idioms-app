export function cleanExpression(expression: string): string {
  return expression.replace(/\s+/g, " ").trim();
}

export function normalize(expression: string): string {
  return expression.trim().toLowerCase();
}
