import { Settings } from "lucide-react";

export default function TopicConfigSection({ data, updateField }) {
  return (
    <section className="space-y-6">
      {/* Main Topic & Dynamic Gen Row */}
      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-grow w-full">
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Main Topic
          </label>
          <input
            type="text"
            value={data.main_topic}
            onChange={(e) => updateField("main_topic", e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            placeholder="Enter the main topic..."
          />
        </div>

        <div className="flex items-center space-x-3 mb-3 shrink-0">
          <span className="text-sm font-medium text-slate-400">
            Dynamic Gen
          </span>
          <button
            onClick={() =>
              updateField("dynamic_generation", !data.dynamic_generation)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              data.dynamic_generation ? "bg-indigo-600" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                data.dynamic_generation ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Context & Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Constraints
            </label>
            <Settings size={14} className="text-slate-600" />
          </div>
          <textarea
            value={data.constraints}
            onChange={(e) => updateField("constraints", e.target.value)}
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed no-scrollbar"
            placeholder="Set tone, length, format..."
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Additional Context
          </label>
          <textarea
            value={data.context}
            onChange={(e) => updateField("context", e.target.value)}
            rows={5}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed no-scrollbar"
            placeholder="Background info, audience details..."
          />
        </div>
      </div>
    </section>
  );
}
