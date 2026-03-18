import { useCallback, useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ProcessingCard } from "./ProcessingCard";
import { MappingResultCard } from "./MappingResultCard";
import { MovedColumnsCard } from "./MovedColumnsCard";
import { ErrorCard } from "./ErrorCard";
import { parseXlsx } from "../lib/parser";
import { mapColumns } from "../lib/mapper";
import { exportXlsx } from "../lib/exporter";
import type { ColumnMapping, Schema } from "../types";

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

interface ToolTabProps {
  schema: Schema;
}

export function ToolTab({ schema }: ToolTabProps) {
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

  const handleFile = useCallback(
    async (file: File) => {
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
    },
    [schema],
  );

  const handleReset = () => {
    setState("idle");
    setMappings([]);
    setError(null);
  };

  return (
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
        <ErrorCard message={error ?? "Erreur inconnue"} onReset={handleReset} />
      )}
    </>
  );
}
