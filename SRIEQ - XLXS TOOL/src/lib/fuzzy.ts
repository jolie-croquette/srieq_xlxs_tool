function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i - 1][j], matrix[i][j - 1]) +
            1;
    }
  }

  return matrix[b.length][a.length];
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function fuzzyMatch(source: string, target: string): boolean {
  const a = normalize(source);
  const b = normalize(target);

  if (a === b) return true;

  const maxDistance = Math.floor(Math.max(a.length, b.length) * 0.2);
  return levenshtein(a, b) <= maxDistance;
}

export function normalizeHeader(str: string): string {
  return normalize(str);
}
