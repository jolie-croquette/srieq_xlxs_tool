import type { ColumnMapping, ParsedFile, Schema } from "../types";
import { fuzzyMatch, normalizeHeader } from "./fuzzy";

function findSourceHeader(
  targetLabel: string,
  aliases: string[],
  sourceHeaders: string[],
): { header: string; confidence: ColumnMapping["confidence"] } | null {
  const candidates = [targetLabel, ...aliases];

  // 1. Exact match
  for (const candidate of candidates) {
    const match = sourceHeaders.find((h) => h === candidate);
    if (match) return { header: match, confidence: "exact" };
  }

  // 2. Normalized exact match
  for (const candidate of candidates) {
    const match = sourceHeaders.find(
      (h) => normalizeHeader(h) === normalizeHeader(candidate),
    );
    if (match) return { header: match, confidence: "exact" };
  }

  // 3. Fuzzy match
  for (const candidate of candidates) {
    const match = sourceHeaders.find((h) => fuzzyMatch(h, candidate));
    if (match) return { header: match, confidence: "fuzzy" };
  }

  return null;
}

export function mapColumns(file: ParsedFile, schema: Schema): ColumnMapping[] {
  return schema.columns.map((col) => {
    const result = findSourceHeader(col.label, col.aliases ?? [], file.headers);

    if (!result) {
      return {
        targetKey: col.key,
        targetLabel: col.label,
        sourceHeader: null,
        confidence: "missing",
      };
    }

    return {
      targetKey: col.key,
      targetLabel: col.label,
      sourceHeader: result.header,
      confidence: result.confidence,
    };
  });
}
