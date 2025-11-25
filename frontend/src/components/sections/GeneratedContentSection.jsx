import { CornerDownRight } from "lucide-react";
import EditableGeneratedSection from "../GeneratedSection";

export default function GeneratedContentSection({
  data,
  updateGeneratedSection,
  removeGeneratedSection,
  handleEvaluation,
  loading,
}) {
  return (
    <section className="pt-8 border-t border-slate-800">
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Generated Content</h2>
      </div>

      <div className="space-y-8">
        {data.generated_content.map((section, index) => (
          <EditableGeneratedSection
            key={section.id}
            index={index}
            section={section}
            updateGeneratedSection={updateGeneratedSection}
            removeGeneratedSection={removeGeneratedSection}
          />
        ))}
      </div>

      {/* EVALUATE BUTTON - At the bottom */}
      <div className="flex justify-center mt-12 pb-12">
        <button
          disabled={loading}
          onClick={!loading ? handleEvaluation : undefined}
          className={
            `flex items-center px-8 py-3 border font-medium rounded-xl shadow-lg transition-all group ` +
            (loading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700"
              : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 hover:scale-105 active:scale-95")
          }
        >
          <CornerDownRight
            size={18}
            className={
              "mr-3 " +
              (!loading ? "group-hover:text-emerald-300" : "text-slate-600")
            }
          />
          {loading ? "Evaluating..." : "Run Evaluation and Upgrade"}
        </button>
      </div>
    </section>
  );
}
