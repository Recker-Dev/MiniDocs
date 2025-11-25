import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const EditableGeneratedSection = ({
  section,
  index,
  updateGeneratedSection,
  removeGeneratedSection,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden transition-all duration-200 hover:border-indigo-500/50">

      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-indigo-400 font-mono text-sm">#{index + 1}</span>

          {/* TITLE AREA */}
          {editingTitle ? (
            <input
              type="text"
              autoFocus
              value={section.section_name}
              onChange={(e) =>
                updateGeneratedSection(section.id, "section_name", e.target.value)
              }
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="bg-transparent text-lg font-semibold text-slate-200 focus:outline-none w-full"
            />
          ) : (
            <div
              className="text-lg font-semibold text-slate-200 cursor-text"
              onClick={() => setEditingTitle(true)}
            >
              {section.section_name || <span className="text-slate-500">Untitled Section</span>}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => removeGeneratedSection(section.id)}
            className="text-slate-500 hover:text-red-400 p-1"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      {isExpanded && (
        <div className="p-4 bg-slate-900/50">

          {/* EDITING MODE */}
          {editingContent ? (
            <textarea
              autoFocus
              value={section.content}
              onChange={(e) =>
                updateGeneratedSection(section.id, "content", e.target.value)
              }
              onBlur={() => setEditingContent(false)}
              className="w-full bg-transparent text-slate-300 text-sm leading-relaxed focus:outline-none resize-none min-h-[10rem]"
            />
          ) : (
            /* MARKDOWN VIEW MODE */
            <div
              className="prose prose-invert max-w-none cursor-text"
              onClick={() => setEditingContent(true)}
            >
              {section.content ? (
                <ReactMarkdown>{section.content}</ReactMarkdown>
              ) : (
                <p className="text-slate-500">Click to add content...</p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default EditableGeneratedSection;
