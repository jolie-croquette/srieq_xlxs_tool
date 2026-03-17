import type { ColumnMapping, ParsedFile, Schema } from "../types";
import { fuzzyMatch, normalizeHeader } from "./fuzzy";

function findSourceHeader(
  targetLabel: string,
  aliases: string[],
  headers: string[],
  rawHeaders: string[],
): {
  header: string;
  index: number;
  confidence: ColumnMapping["confidence"];
} | null {
  const candidates = [targetLabel, ...aliases];

  for (const candidate of candidates) {
    const index = rawHeaders.findIndex((h) => h === candidate);
    if (index !== -1)
      return { header: headers[index], index, confidence: "exact" };
  }

  for (const candidate of candidates) {
    const index = rawHeaders.findIndex(
      (h) => normalizeHeader(h) === normalizeHeader(candidate),
    );
    if (index !== -1)
      return { header: headers[index], index, confidence: "exact" };
  }

  for (const candidate of candidates) {
    const index = rawHeaders.findIndex((h) => fuzzyMatch(h, candidate));
    if (index !== -1)
      return { header: headers[index], index, confidence: "fuzzy" };
  }

  return null;
}

export function mapColumns(file: ParsedFile, schema: Schema): ColumnMapping[] {
  return schema.columns.map((col, targetIndex) => {
    const result = findSourceHeader(
      col.label,
      col.aliases ?? [],
      file.headers,
      file.rawHeaders,
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
