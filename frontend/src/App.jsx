import React, { useEffect, useState } from "react";
import EvaluationTracker from "./components/EvaluationHistory";

import Header from "./components/sections/Header";
import TopicConfigSection from "./components/sections/TopicConfigSection";
import TopicSectionStructure from "./components/sections/TopicSectionStructure";
import GeneratedContentSection from "./components/sections/GeneratedContentSection";

import { initialData } from "./placeholderdata";

export default function App() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // --- State Helpers ---
  const updateField = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));

  // --- User Sections ---
  const updateSection = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };
  const addSection = () => {
    setData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: Date.now(), section_name: "", description: "" },
      ],
    }));
  };
  const removeSection = (id) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  // --- Generated Content ---
  const updateGeneratedSection = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      generated_content: prev.generated_content.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };
  const removeGeneratedSection = (id) => {
    setData((prev) => ({
      ...prev,
      generated_content: prev.generated_content.filter((s) => s.id !== id),
    }));
  };

  // --- Validation for Full Gen ---
  const isFullGenEnabled = () => {
    // Enable only if main_topic is set
    return data.main_topic.trim() !== "";
  };

  /////------------------------- FULL GENERATION LOGIC ---------------------------//////
  const handleFullGen = async () => {
    if (!isFullGenEnabled()) return;

    setLoading(true);
    try {
      const payload = {
        main_topic: data.main_topic,
        dynamic_generation: data.dynamic_generation ? "true" : "false",
        // expected_sections_count: data.sections.length.toString(),
        sections: data.sections.map(({ section_name, description }) => ({
          section_name,
          description,
        })),
        constraints: data.constraints,
        context: data.context,
      };

      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setData((prev) => ({
        ...prev,
        generated_content: result.generated_content || [],
        eval_hist_payload: [
          ...prev.eval_hist_payload,
          {
            coherency_score: result.coherency_score,
            evaluator_diagnostic_summary: result.evaluator_diagnostic_summary,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err) {
      console.error("Full Gen error:", err);
    } finally {
      setLoading(false);
    }
  };

  /////------------------------- EVALUATION LOGIC ---------------------------//////

  const handleEvaluation = async () => {
    // --- Guard conditions ---
    if (!data.main_topic.trim()) {
      console.warn("Evaluation blocked: main_topic missing");
      return;
    }

    if (!data.generated_content || data.generated_content.length === 0) {
      console.warn("Evaluation blocked: no generated content");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        main_topic: data.main_topic,
        dynamic_generation: data.dynamic_generation ? "true" : "false",
        expected_sections_count: data.sections.length.toString(),
        sections: data.sections.map(({ section_name, description }) => ({
          section_name,
          description,
        })),
        constraints: data.constraints,
        context: data.context,
        generated_content: data.generated_content.map(
          ({ section_name, content }) => ({
            section_name,
            content,
          })
        ),
      };

      const response = await fetch("http://localhost:8000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Evaluation API error: ${response.status}`);
      }

      const result = await response.json();

      // result = { generated_content, eval_hist_payload }
      setData((prev) => ({
        ...prev,
        generated_content: result.generated_content || prev.generated_content,
        eval_hist_payload: [
          ...prev.eval_hist_payload,
          ...result.eval_hist_payload, // backend returns a list
        ],
      }));
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Validation for Export ---
  const isExportDisabled =
    !Array.isArray(data.generated_content) ||
    data.generated_content.length === 0;

  /////------------------------- EXPORT LOGIC ---------------------------//////
  const handleExport = async (type) => {
    if (isExportDisabled) return;

    setLoading(true);

    try {
      const payload = {
        generated_content: data.generated_content.map(
          ({ section_name, content, id }) => ({
            section_name,
            content,
            id,
          })
        ),
        type, // "doc" or "ppt"
      };

      const response = await fetch("http://localhost:8000/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const filename = type === "ppt" ? "minidoc.pptx" : "minidoc.docx";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Custom Styles for Scrollbars */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        {/* Header */}
        <Header
          isExportDisabled={isExportDisabled}
          handleExport={handleExport}
        />

        {/* --- Evaluation History Tracker --- */}
        <EvaluationTracker history={data.eval_hist_payload} />

        <div className="space-y-12">
          {/* --- Topic Configuration --- */}
          <TopicConfigSection data={data} updateField={updateField} />

          {/* --- Topic Sections Definition --- */}
          <TopicSectionStructure
            data={data}
            addSection={addSection}
            updateSection={updateSection}
            removeSection={removeSection}
            handleFullGen={handleFullGen}
            isFullGenEnabled={isFullGenEnabled}
            loading={loading}
          />

          {/* --- 3. Generated Content --- */}
          {data.generated_content && data.generated_content.length > 0 && (
            <GeneratedContentSection
              data={data}
              updateGeneratedSection={updateGeneratedSection}
              removeGeneratedSection={removeGeneratedSection}
              handleEvaluation={handleEvaluation}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
