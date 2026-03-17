export interface TargetColumn {
  key: string;
  label: string;
  required: boolean;
  aliases?: string[];
}

export interface Schema {
  id: string;
  name: string;
  columns: TargetColumn[];
}

export type MatchConfidence = "exact" | "fuzzy" | "missing";

export interface ColumnMapping {
  targetKey: string;
  targetLabel: string;
  sourceHeader: string | null;
  confidence: MatchConfidence;
}

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}
