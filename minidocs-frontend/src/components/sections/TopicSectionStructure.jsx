import { Plus, Zap } from "lucide-react";
import UserDefinedSection from "../UserDefinedSection";

export default function TopicSectionStructure({
  data,
  addSection,
  updateSection,
  removeSection,
  handleFullGen,
  isFullGenEnabled,
  loading
}) {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-2">
        <h2 className="text-lg font-semibold text-white">Section Structure</h2>
        <button
          onClick={addSection}
          className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1.5 rounded-full transition-colors"
        >
          <Plus size={14} className="mr-1" /> Add Section
        </button>
      </div>

      {/* User Sections */}
      <div className="pl-2">
        {data.sections.map((section) => (
          <UserDefinedSection
            key={section.id}
            section={section}
            updateSection={updateSection}
            removeSection={removeSection}
          />
        ))}
      </div>

      {/* Full Generation Button */}
      <div className="flex justify-end pt-8 sticky bottom-4 z-10 pointer-events-none">
        <button
          onClick={handleFullGen}
          disabled={!isFullGenEnabled() || loading}
          className={`pointer-events-auto flex items-center px-6 py-2.5 text-white font-medium rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
            isFullGenEnabled()
              ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Zap size={18} className="mr-2" />
          {loading ? "Generating..." : "Full Gen"}
        </button>
      </div>
    </section>
  );
}
