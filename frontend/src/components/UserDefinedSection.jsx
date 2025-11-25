// --- Input Section Component ---
import { Trash2 } from "lucide-react";

const UserDefinedSection = ({ section, updateSection, removeSection }) => (
  <div className="group relative pl-4 border-l-2 border-slate-700 hover:border-indigo-500 transition-colors mb-6">
    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-indigo-500 transition-colors"></div>
    <div className="flex justify-between items-start mb-2">
      <input
        type="text"
        value={section.section_name}
        onChange={(e) =>
          updateSection(section.id, "section_name", e.target.value)
        }
        className="bg-transparent text-base font-medium text-indigo-300 focus:outline-none placeholder-slate-600 w-full"
        placeholder="Section Name"
      />
      <button
        onClick={() => removeSection(section.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
      >
        <Trash2 size={16} />
      </button>
    </div>
    <textarea
      value={section.description}
      onChange={(e) => updateSection(section.id, "description", e.target.value)}
      className="w-full bg-slate-800/50 text-slate-400 text-sm rounded p-2 focus:bg-slate-800 focus:text-slate-200 focus:outline-none transition-colors resize-none no-scrollbar"
      rows={2}
      placeholder="Brief description..."
    />
  </div>
);

export default UserDefinedSection;