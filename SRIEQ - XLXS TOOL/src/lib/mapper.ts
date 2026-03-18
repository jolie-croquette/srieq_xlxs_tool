import type { ColumnMapping, ParsedFile, Schema } from "../types";
import { fuzzyMatch, normalizeHeader } from "./fuzzy";

function findSourceHeader(
  targetLabel: string,
  aliases: string[],
  headers: string[],
  rawHeaders: string[],
  usedIndexes: Set<number>,
): {
  header: string;
  index: number;
  confidence: ColumnMapping["confidence"];
} | null {
  const candidates = [targetLabel, ...aliases];

  // Exact match
  for (const candidate of candidates) {
    const index = rawHeaders.findIndex(
      (h, i) => h === candidate && !usedIndexes.has(i),
    );
    if (index !== -1)
      return { header: headers[index], index, confidence: "exact" };
  }

  // Normalized exact match
  for (const candidate of candidates) {
    const index = rawHeaders.findIndex(
      (h, i) =>
        normalizeHeader(h) === normalizeHeader(candidate) &&
        !usedIndexes.has(i),
    );
    if (index !== -1)
      return { header: headers[index], index, confidence: "exact" };
  }

  // Fuzzy match
  for (const candidate of candidates) {
    const index = rawHeaders.findIndex(
      (h, i) => fuzzyMatch(h, candidate) && !usedIndexes.has(i),
    );
    if (index !== -1)
      return { header: headers[index], index, confidence: "fuzzy" };
  }

  return null;
}

export function mapColumns(file: ParsedFile, schema: Schema): ColumnMapping[] {
  const usedIndexes = new Set<number>();

  return schema.columns.map((col, targetIndex) => {
    const result = findSourceHeader(
      col.label,
      col.aliases ?? [],
      file.headers,
      file.rawHeaders,
      usedIndexes,
    );

    if (!result) {
      return {
        targetKey: col.key,
        targetLabel: col.label,
        sourceHeader: null,
        sourceIndex: null,
        targetIndex,
        confidence: "missing",
      };
    }

    usedIndexes.add(result.index);

    return {
      targetKey: col.key,
      targetLabel: col.label,
      sourceHeader: result.header,
      sourceIndex: result.index,
      targetIndex,
      confidence: result.confidence,
    };
  });
}
