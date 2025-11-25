import { Anvil, FileText, Presentation } from "lucide-react";

export default function Header({ isExportDisabled, handleExport }) {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Anvil className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Content Forge
            </h1>
          </div>
          <p className="text-slate-500 ml-1">
            Define appropriate structure
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            disabled={isExportDisabled}
            onClick={() => handleExport("doc")}
            className={
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-all ` +
              (isExportDisabled
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:scale-105 active:scale-95")
            }
          >
            <FileText size={16} className="mr-2" />
            Export as Docs
          </button>

          <button
            disabled={isExportDisabled}
            onClick={() => handleExport("ppt")}
            className={
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-all ` +
              (isExportDisabled
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20 hover:scale-105 active:scale-95")
            }
          >
            <Presentation size={16} className="mr-2" />
            Export as Ppt
          </button>
        </div>
      </div>
    </header>
  );
}
