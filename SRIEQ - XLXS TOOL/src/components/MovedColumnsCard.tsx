import type { ColumnMapping } from "../types";

interface MovedColumnsCardProps {
  mappings: ColumnMapping[];
}

type RowStatus = "same" | "moved" | "missing";

interface DiffRow {
  sourceHeader: string | null;
  sourceIndex: number | null;
  targetLabel: string;
  targetIndex: number;
  status: RowStatus;
}

function buildDiffRows(mappings: ColumnMapping[]): DiffRow[] {
  return mappings.map((m) => {
    let status: RowStatus = "same";
    if (m.sourceHeader === null) status = "missing";
    else if (m.sourceIndex !== m.targetIndex) status = "moved";

    return {
      sourceHeader: m.sourceHeader,
      sourceIndex: m.sourceIndex,
      targetLabel: m.targetLabel,
      targetIndex: m.targetIndex,
      status,
    };
  });
}

const rowStyle: Record<
  RowStatus,
  { left: string; right: string; text: string }
> = {
  same: {
    left: "",
    right: "border-l border-gray-100",
    text: "",
  },
  moved: {
    left: "bg-amber-50",
    right: "bg-green-50 border-l border-gray-100",
    text: "",
  },
  missing: {
    left: "bg-red-50",
    right: "bg-red-50 border-l border-gray-100",
    text: "",
  },
};

const textStyle: Record<RowStatus, { left: string; right: string }> = {
  same: { left: "text-gray-700", right: "text-gray-700" },
  moved: { left: "text-amber-700", right: "text-green-700" },
  missing: { left: "text-red-600", right: "text-red-600" },
};

export function MovedColumnsCard({ mappings }: MovedColumnsCardProps) {
  const rows = buildDiffRows(mappings);
  const movedCount = rows.filter((r) => r.status === "moved").length;
  const missingCount = rows.filter((r) => r.status === "missing").length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-2 border-b border-gray-100">
        <div className="px-4 py-3 bg-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
          Fichier source
        </div>
        <div className="px-4 py-3 bg-gray-50 border-l border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
          Fichier output
        </div>
      </div>

      {/* Rows */}
      <div className="font-mono text-xs">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-2 ${i !== rows.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <div
              className={`px-4 py-2 flex items-center gap-3 ${rowStyle[row.status].left}`}
            >
              <span className="text-gray-300 w-5 text-right shrink-0">
                {row.sourceIndex !== null ? row.sourceIndex + 1 : "—"}
              </span>
              <span className={textStyle[row.status].left}>
                {row.sourceHeader ?? "—"}
              </span>
            </div>
            <div
              className={`px-4 py-2 flex items-center gap-3 ${rowStyle[row.status].right}`}
            >
              <span className="text-gray-300 w-5 text-right shrink-0">
                {row.targetIndex + 1}
              </span>
              <span className={textStyle[row.status].right}>
                {row.targetLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 bg-gray-50">
        {movedCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-100" />
            {movedCount} déplacée{movedCount > 1 ? "s" : ""}
          </div>
        )}
        {missingCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-100" />
            {missingCount} introuvable{missingCount > 1 ? "s" : ""}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-white border border-gray-200" />
          Identique
        </div>
      </div>
    </div>
  );
}
