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
  sourceIndex: number | null;
  targetIndex: number;
  confidence: MatchConfidence;
}

export interface ParsedFile {
  headers: string[]; // headers avec suffixes pour doublons
  rawHeaders: string[]; // headers originaux sans modification
  rows: Record<string, string>[];
}
