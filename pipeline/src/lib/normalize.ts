export function cleanExpression(expression: string): string {
  return expression.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function normalize(expression: string): string {
  return expression.normalize("NFKC").trim().toLowerCase();
}
