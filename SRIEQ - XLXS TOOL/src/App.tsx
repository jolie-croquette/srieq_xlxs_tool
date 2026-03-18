import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { ToolTab } from "./components/ToolTab";
import { SchemaViewer } from "./components/SchemaViewer";
import { SchemaStatusCard } from "./components/SchemaStatusCard";
import { SchemaEditor } from "./pages/SchemaEditor";
import { useSchema } from "./hooks/useSchema";
import { ConfigPage } from "./pages/ConfigPage";

type Tab = "tool" | "schema";

export default function App() {
  const [tab, setTab] = useState<Tab>("tool");
  const { schema, status, error, updateSchema, retry } = useSchema();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-white flex items-start justify-center p-8 pt-16">
            <div className="w-full max-w-xl flex flex-col gap-6">
              <Header tab={tab} onTabChange={setTab} />

              {status === "loading" && <SchemaStatusCard status="loading" />}

              {status === "error" && (
                <SchemaStatusCard
                  status="error"
                  error={error}
                  onRetry={retry}
                />
              )}

              {status === "success" && schema && (
                <>
                  {tab === "tool" && <ToolTab schema={schema} />}
                  {tab === "schema" && (
                    <SchemaViewer
                      schema={schema}
                      onSchemaUpdate={updateSchema}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        }
      />
      <Route path="/schema" element={<SchemaEditor />} />
      <Route path="/config" element={<ConfigPage />} />
    </Routes>
  );
}
