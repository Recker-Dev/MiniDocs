import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Activity } from "lucide-react";

const EvaluationTracker = ({ history }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const itemRefs = useRef([]);

  const toggleOpen = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openIndex === null) return;

      const ref = itemRefs.current[openIndex];
      if (ref && !ref.contains(event.target)) {
        setOpenIndex(null); // close panel
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openIndex]);

  const getColorClass = (score) => {
    if (score < 0.5) return "bg-red-500 shadow-red-500/50 text-red-100";
    if (score < 0.85)
      return "bg-yellow-500 shadow-yellow-500/50 text-yellow-900";
    return "bg-emerald-500 shadow-emerald-500/50 text-white";
  };

  const getIcon = (score) => {
    if (score < 0.5) return <AlertCircle size={14} />;
    if (score < 0.85) return <Activity size={14} />;
    return <CheckCircle size={14} />;
  };

  return (
    <div className="mb-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Evaluation History
        </h3>
        <span className="text-xs text-slate-600">
          {history.length} iterations
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-visible pb-2 no-scrollbar">
        {history.map((entry, idx) => (
          <div
            key={idx}
            className="relative"
            ref={(el) => (itemRefs.current[idx] = el)}
          >
            {/* Connecting Line */}
            {idx < history.length - 1 && (
              <div className="absolute top-1/2 left-8 w-8 h-0.5 bg-slate-800 -z-10"></div>
            )}

            {/* Node */}
            <div
              onClick={() => toggleOpen(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer 
              transition-all duration-300 transform hover:scale-110 shadow-lg relative
              ${getColorClass(entry.coherency_score)}
              group`}
            >
              {getIcon(entry.coherency_score)}

              {/* Hover score bubble */}
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 
                  transition-opacity text-[10px] bg-slate-800 border border-slate-700
                  px-2 py-0.5 rounded-md whitespace-nowrap text-slate-300 shadow-xl z-50"
              >
                {entry.coherency_score}
              </div>
            </div>

            {/* CLICKED_DETAIL_PANEL */}
            {openIndex === idx && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-12 w-72 bg-slate-900 border border-slate-700 
                  rounded-lg p-4 shadow-2xl z-50 animate-fadeIn"
              >
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                  <span className="font-bold text-slate-300">
                    Run #{idx + 1}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      entry.coherency_score < 0.5
                        ? "text-red-400"
                        : entry.coherency_score < 0.85
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >
                    Score: {entry.coherency_score}
                  </span>
                </div>

                <p className="text-slate-400 leading-relaxed text-sm">
                  {entry.evaluator_diagnostic_summary}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Placeholder for next run */}
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationTracker;
