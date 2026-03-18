import { useCallback, useState } from "react";
import { FileDropzone } from "./components/FileDropzone";
import { ProcessingCard } from "./components/ProcessingCard";
import { MappingResultCard } from "./components/MappingResultCard";
import { MovedColumnsCard } from "./components/MovedColumnsCard";
import { ErrorCard } from "./components/ErrorCard";
import { SchemaViewer } from "./components/SchemaViewer";
import { parseXlsx } from "./lib/parser";
import { mapColumns } from "./lib/mapper";
import { exportXlsx } from "./lib/exporter";
import { schema } from "./schemas";
import type { ColumnMapping } from "./types";

type AppState = "idle" | "processing" | "done" | "error";
type Tab = "tool" | "schema";

interface ProcessingStep {
  label: string;
  status: "pending" | "done";
}

const STEPS: ProcessingStep[] = [
  { label: "Lecture du fichier", status: "pending" },
  { label: "Extraction des en-têtes", status: "pending" },
  { label: "Comparaison avec le schéma cible", status: "pending" },
  { label: "Génération du fichier output", status: "pending" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [steps, setSteps] = useState<ProcessingStep[]>(STEPS);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tool");

  const completeStep = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: "done" } : s)),
    );
  };

  const handleFile = useCallback(async (file: File) => {
    setState("processing");
    setTab("tool");
    setSteps(STEPS.map((s) => ({ ...s, status: "pending" })));
    setFileName(file.name);
    setError(null);

    try {
      await sleep(400);
      completeStep(0);

      const parsed = await parseXlsx(file);
      await sleep(300);
      completeStep(1);

      const mapped = mapColumns(parsed, schema);
      await sleep(600);
      completeStep(2);

      const missingRequired = schema.columns
        .filter((col) => col.required)
        .filter(
          (col) =>
            mapped.find((m) => m.targetKey === col.key)?.confidence ===
            "missing",
        );

      if (missingRequired.length > 0) {
        throw new Error(
          `Colonnes requises introuvables : ${missingRequired.map((c) => c.label).join(", ")}`,
        );
      }

      exportXlsx(parsed, mapped);
      await sleep(400);
      completeStep(3);

      setMappings(mapped);
      await sleep(300);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setState("error");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setMappings([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-8 pt-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
            SRIEQ
          </p>
          <h1 className="text-2xl font-medium text-gray-900">
            Reformatteur XLSX
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Importe un fichier, reçois le fichier corrigé.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-gray-100">
            {(["tool", "schema"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-sm px-4 py-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
                  tab === t
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "tool" ? "Outil" : "Schéma attendu"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab : Outil */}
        {tab === "tool" && (
          <>
            {state === "idle" && <FileDropzone onFileParsed={handleFile} />}

            {state === "processing" && (
              <ProcessingCard fileName={fileName} steps={steps} />
            )}

            {state === "done" && (
              <>
                <MappingResultCard mappings={mappings} />
                <MovedColumnsCard mappings={mappings} />
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Importer un autre fichier
                </button>
              </>
            )}

            {state === "error" && (
              <ErrorCard
                message={error ?? "Erreur inconnue"}
                onReset={handleReset}
              />
            )}
          </>
        )}

        {/* Tab : Schéma */}
        {tab === "schema" && <SchemaViewer />}
      </div>
    </div>
  );
}
