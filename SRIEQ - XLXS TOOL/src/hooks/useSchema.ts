import { useState, useEffect } from "react";
import { fetchSchema } from "../lib/schemaApi";
import type { Schema, TargetColumn } from "../types";

type SchemaStatus = "loading" | "success" | "error";

interface UseSchemaReturn {
  schema: Schema | null;
  status: SchemaStatus;
  error: string | null;
  updateSchema: (columns: TargetColumn[]) => void;
  retry: () => void;
}

export function useSchema(): UseSchemaReturn {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [status, setStatus] = useState<SchemaStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchSchema()
      .then((columns: TargetColumn[]) => {
        if (cancelled) return;
        setSchema({ id: "default", name: "Schéma cible", columns });
        setStatus("success");
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const updateSchema = (columns: TargetColumn[]) => {
    setSchema({ id: "default", name: "Schéma cible", columns });
  };

  const retry = () => setRetryCount((c) => c + 1);

  return { schema, status, error, updateSchema, retry };
}
