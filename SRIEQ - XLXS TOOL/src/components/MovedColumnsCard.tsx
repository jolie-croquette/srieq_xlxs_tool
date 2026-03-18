import { useState, useMemo } from "react";
import { MoveRight, Search } from "lucide-react";
import type { ColumnMapping } from "../types";

interface MovedColumnsCardProps {
  mappings: ColumnMapping[];
}

type FilterType = "all" | "moved" | "missing" | "same";

type RowStatus = "same" | "moved" | "missing";

interface DiffRow {
  sourceHeader: string | null;
  sourceIndex: number | null;
  targetLabel: string;
  targetIndex: number;
  status: RowStatus;
}

function toExcelCol(index: number): string {
  let col = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    n = Math.floor((n - 1) / 26);
  }
  return col;
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

const rowBg: Record<RowStatus, { left: string; right: string }> = {
  same: { left: "", right: "border-l border-gray-100" },
  moved: { left: "bg-amber-50", right: "bg-green-50 border-l border-gray-100" },
  missing: { left: "bg-red-50", right: "bg-red-50 border-l border-gray-100" },
};

const rowText: Record<RowStatus, { left: string; right: string }> = {
  same: { left: "text-gray-700", right: "text-gray-700" },
  moved: { left: "text-amber-700", right: "text-green-700" },
  missing: { left: "text-red-500", right: "text-red-500" },
};

export function MovedColumnsCard({ mappings }: MovedColumnsCardProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const allRows = useMemo(() => buildDiffRows(mappings), [mappings]);

  const movedCount = allRows.filter((r) => r.status === "moved").length;
  const missingCount = allRows.filter((r) => r.status === "missing").length;
  const sameCount = allRows.filter((r) => r.status === "same").length;

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      const matchesFilter = filter === "all" || row.status === filter;
      const matchesSearch =
        search === "" ||
        row.targetLabel.toLowerCase().includes(search.toLowerCase()) ||
        (row.sourceHeader ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allRows, filter, search]);

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Tout", count: allRows.length },
    { key: "moved", label: "Déplacées", count: movedCount },
    { key: "missing", label: "Introuvables", count: missingCount },
    { key: "same", label: "Identiques", count: sameCount },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
        <MoveRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900">
          Comparaison des colonnes
        </span>
      </div>

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        {/* Filtres */}
        <div className="flex items-center gap-1.5">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`
                text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer
                ${
                  filter === btn.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }
              `}
            >
              {btn.label}
              <span
                className={`ml-1.5 ${filter === btn.key ? "text-gray-300" : "text-gray-400"}`}
              >
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:border-gray-300 transition-colors">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs text-gray-700 outline-none w-36 placeholder-gray-400 bg-transparent"
          />
        </div>
      </div>

      {/* Colonnes header */}
      <div className="grid grid-cols-2 border-b border-gray-100">
        <div className="px-4 py-2.5 bg-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
          Fichier source
        </div>
        <div className="px-4 py-2.5 bg-gray-50 border-l border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
          Fichier output
        </div>
      </div>

      {/* Rows */}
      <div className="font-mono text-xs max-h-96 overflow-y-auto">
        {filteredRows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            Aucune colonne trouvée
          </div>
        ) : (
          filteredRows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-2 ${i !== filteredRows.length - 1 ? "border-b border-gray-50" : ""}`}
            >
              <div
                className={`px-4 py-2 flex items-center gap-3 ${rowBg[row.status].left}`}
              >
                <span className="text-gray-300 w-5 text-right shrink-0">
                  {row.sourceIndex !== null ? toExcelCol(row.sourceIndex) : "—"}
                </span>
                <span className={rowText[row.status].left}>
                  {row.sourceHeader ?? "—"}
                </span>
              </div>
              <div
                className={`px-4 py-2 flex items-center gap-3 ${rowBg[row.status].right}`}
              >
                <span className="text-gray-300 w-5 text-right shrink-0">
                  {toExcelCol(row.targetIndex)}
                </span>
                <span className={rowText[row.status].right}>
                  {row.targetLabel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 bg-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-100" />
          Déplacée
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-100" />
          Introuvable
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-white border border-gray-200" />
          Identique
        </div>
        <span className="ml-auto text-xs text-gray-400">
          {filteredRows.length} / {allRows.length} colonnes
        </span>
      </div>
    </div>
  );
}
