interface ProcessingStep {
  label: string;
  status: "pending" | "done";
}

interface ProcessingCardProps {
  fileName: string;
  steps: ProcessingStep[];
}

export function ProcessingCard({ fileName, steps }: ProcessingCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">{fileName}</span>
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
  );
}
