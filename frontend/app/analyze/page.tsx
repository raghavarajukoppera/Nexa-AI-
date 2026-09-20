"use client";

import { useState } from "react";

type AnalysisResult = {
  id: number;
  resume_id: number;
  overall_score: number | null;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendations: string | null;
  created_at: string;
};

type ResumeResult = {
  id: number;
  user_id: number;
  filename: string;
  file_path: string | null;
  extracted_text: string | null;
  uploaded_at: string;
};

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [resume, setResume] =
    useState<ResumeResult | null>(null);
  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setAnalysis(null);
    setResume(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extension !== "pdf" &&
      extension !== "docx"
    ) {
      setError(
        "Please upload a PDF or DOCX file."
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const analyzeResume = async () => {
    if (!file) {
      setError(
        "Please select your resume first."
      );
      return;
    }

    const token = localStorage.getItem(
      "nexa_access_token"
    );

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      // --------------------------------
      // STEP 1: UPLOAD RESUME
      // --------------------------------

      const formData = new FormData();

      formData.append("file", file);

      const uploadResponse = await fetch(
        "http://127.0.0.1:8000/api/resumes/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (
        uploadResponse.status === 401
      ) {
        localStorage.removeItem(
          "nexa_access_token"
        );

        window.location.href = "/login";
        return;
      }

      if (!uploadResponse.ok) {
        const uploadError =
          await uploadResponse.json();

        throw new Error(
          uploadError.detail ||
            "Resume upload failed."
        );
      }

      const resumeData: ResumeResult =
        await uploadResponse.json();

      setResume(resumeData);

      // --------------------------------
      // STEP 2: AI ANALYSIS
      // --------------------------------

      const analysisResponse =
        await fetch(
          `http://127.0.0.1:8000/api/analyses/resume/${resumeData.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (
        analysisResponse.status === 401
      ) {
        localStorage.removeItem(
          "nexa_access_token"
        );

        window.location.href = "/login";
        return;
      }

      if (!analysisResponse.ok) {
        const analysisError =
          await analysisResponse.json();

        throw new Error(
          analysisError.detail ||
            "Resume analysis failed."
        );
      }

      const analysisData: AnalysisResult =
        await analysisResponse.json();

      setAnalysis(analysisData);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setResume(null);
    setAnalysis(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">

          <button
            onClick={() =>
              window.history.back()
            }
            className="mb-8 text-sm text-white/40 transition hover:text-white"
          >
            ← Back
          </button>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/50">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            NEXA AI Resume Intelligence
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Analyze your resume
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/40">
            Upload your resume and let NEXA AI
            analyze your skills, experience,
            projects, structure, and career
            readiness.
          </p>
        </div>

        {/* Upload */}
        {!analysis && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-10">

            <div className="mb-8">
              <h2 className="text-xl font-medium">
                Upload your resume
              </h2>

              <p className="mt-2 text-sm text-white/35">
                Supported formats: PDF and DOCX
              </p>
            </div>

            <label
              htmlFor="resume-upload"
              className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 text-center transition hover:border-white/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <span className="text-2xl">
                  ↑
                </span>
              </div>

              <h3 className="mt-6 text-lg font-medium">
                {file
                  ? file.name
                  : "Choose your resume"}
              </h3>

              <p className="mt-2 text-sm text-white/35">
                {file
                  ? `${(
                      file.size / 1024
                    ).toFixed(1)} KB`
                  : "Click here to browse your files"}
              </p>

              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={analyzeResume}
              disabled={
                !file || isAnalyzing
              }
              className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isAnalyzing
                ? "NEXA AI is analyzing your resume..."
                : "Analyze Resume"}
            </button>

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                <p className="mt-4 text-sm text-white/35">
                  Uploading resume and
                  generating AI insights...
                </p>
              </div>
            )}

          </div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="space-y-6">

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

                <div>
                  <p className="text-sm text-white/35">
                    Resume analyzed
                  </p>

                  <h2 className="mt-2 text-xl font-medium">
                    {resume?.filename}
                  </h2>
                </div>

                <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <span className="text-3xl font-semibold">
                    {analysis.overall_score ??
                      0}
                  </span>

                  <span className="text-xs text-white/30">
                    / 100
                  </span>
                </div>

              </div>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs font-medium tracking-widest text-white/30">
                AI SUMMARY
              </p>

              <p className="mt-5 text-base leading-8 text-white/60">
                {analysis.summary}
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">

              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
                <p className="text-xs font-medium tracking-widest text-white/30">
                  STRENGTHS
                </p>

                <div className="mt-5 whitespace-pre-line text-sm leading-7 text-white/55">
                  {analysis.strengths}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
                <p className="text-xs font-medium tracking-widest text-white/30">
                  AREAS TO IMPROVE
                </p>

                <div className="mt-5 whitespace-pre-line text-sm leading-7 text-white/55">
                  {analysis.weaknesses}
                </div>
              </section>

            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <p className="text-xs font-medium tracking-widest text-white/30">
                NEXA RECOMMENDATIONS
              </p>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-white/55">
                {analysis.recommendations}
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                onClick={resetAnalyzer}
                className="flex-1 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Analyze Another Resume
              </button>

              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard")
                }
                className="flex-1 rounded-2xl border border-white/10 px-6 py-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
              >
                View Dashboard
              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}