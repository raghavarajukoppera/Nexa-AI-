"use client";

import { useEffect, useState } from "react";

type Resume = {
  id: number;
  filename: string;
};

type RagResponse = {
  resume_id: number;
  query: string;
  answer: string;
  sources: string[];
  retrieved_chunks: string[];
  count: number;
};

export default function RagPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RagResponse | null>(null);

  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nexa_access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadResumes = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/resumes/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load resumes");
        }

        const data = await response.json();

        setResumes(data);

        if (data.length > 0) {
          setSelectedResume(String(data[0].id));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load resumes"
        );
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);

  const askRag = async () => {
    setError("");
    setResult(null);

    if (!selectedResume) {
      setError("Please select a resume.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a question.");
      return;
    }

    const token = localStorage.getItem("nexa_access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoadingAnswer(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/rag/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resume_id: Number(selectedResume),
            query: query.trim(),
            top_k: 5,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate answer"
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoadingAnswer(false);
    }
  };

  const exampleQuestions = [
    "What are my main technical skills?",
    "What skills am I missing for an AI Engineer role?",
    "Summarize my strongest experience.",
    "What technologies have I worked with?",
  ];

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="mb-6 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-4xl font-bold">
            NEXA AI RAG
          </h1>

          <p className="mt-3 text-gray-400">
            Ask questions about your resume and get
            AI-generated answers grounded in your resume.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Select Resume
            </label>

            {loadingResumes ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-gray-400">
                Loading resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300">
                No resumes found. Upload a resume first.
              </div>
            ) : (
              <select
                value={selectedResume}
                onChange={(event) => {
                  setSelectedResume(event.target.value);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                {resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                    className="bg-[#0b1020]"
                  >
                    {resume.filename}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Ask NEXA AI
            </label>

            <textarea
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Ask something about your resume..."
              rows={5}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm text-gray-400">
              Try an example:
            </p>

            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setQuery(question);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={askRag}
            disabled={
              loadingAnswer ||
              loadingResumes ||
              resumes.length === 0
            }
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingAnswer
              ? "NEXA AI is thinking..."
              : "Ask NEXA AI"}
          </button>
        </section>

        {result && (
          <section className="mt-8 space-y-6">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  AI Answer
                </h2>

                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                  RAG Powered
                </span>
              </div>

              <div className="whitespace-pre-wrap leading-7 text-gray-200">
                {result.answer}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Retrieved Context
              </h2>

              <p className="mb-5 text-sm text-gray-400">
                NEXA AI retrieved {result.count} relevant
                section{result.count === 1 ? "" : "s"} from
                your resume.
              </p>

              <div className="space-y-4">
                {result.retrieved_chunks.map(
                  (chunk, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Context {index + 1}
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                        {chunk}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  Sources
                </h2>

                <ul className="space-y-2">
                  {result.sources.map(
                    (source, index) => (
                      <li
                        key={index}
                        className="rounded-lg bg-black/20 px-4 py-3 text-sm text-gray-300"
                      >
                        {source}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}