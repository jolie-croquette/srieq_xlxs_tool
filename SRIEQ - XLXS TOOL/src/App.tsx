import { useCallback, useState } from "react";
import { FileDropzone } from "./components/FileDropzone";
import { parseXlsx } from "./lib/parser";
import { mapColumns } from "./lib/mapper";
import { exportXlsx } from "./lib/exporter";
import { schema } from "./schemas";
import type { ColumnMapping } from "./types";

type AppState = "idle" | "processing" | "done" | "error";

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

  const completeStep = (index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: "done" } : s)),
    );
  };

  const handleFile = useCallback(async (file: File) => {
    setState("processing");
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

  const badgeClass = (confidence: ColumnMapping["confidence"]) => {
    if (confidence === "exact") return "bg-green-100 text-green-800";
    if (confidence === "fuzzy") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-8 pt-16">
      <div className="w-full max-w-xl flex flex-col gap-6">
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
        </div>

        {state === "idle" && <FileDropzone onFileParsed={handleFile} />}

        {state === "processing" && (
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                {fileName}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300 ${
                      step.status === "done" ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                  <span
                    className={`transition-colors duration-300 ${
                      step.status === "done" ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900">
                Traitement complété
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {mappings.length} colonnes mappées
              </span>
            </div>

            <div className="px-5 py-4 flex flex-col gap-2.5">
              {mappings.map((m) => (
                <div
                  key={m.targetKey}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="font-mono text-xs text-gray-400 flex-1 truncate">
                    {m.sourceHeader ?? "—"}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-300 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="text-gray-900 flex-1">{m.targetLabel}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badgeClass(m.confidence)}`}
                  >
                    {m.confidence}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Importer un autre fichier
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-5">
            <p className="text-sm font-medium text-red-800 mb-1">
              Erreur lors du traitement
            </p>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="text-sm text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors cursor-pointer bg-transparent"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
