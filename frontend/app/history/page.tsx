"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Analysis = {
  id: number;
  resume_id: number;
  overall_score: number | null;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendations: string | null;
  created_at: string;
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<Analysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    const token = localStorage.getItem("nexa_access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/analyses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("nexa_access_token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load analysis history");
      }

      const data = await response.json();

      setAnalyses(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your analysis history.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getScoreClass(score: number | null) {
    if (score === null) {
      return "score-neutral";
    }

    if (score >= 80) {
      return "score-good";
    }

    if (score >= 60) {
      return "score-medium";
    }

    return "score-low";
  }

  function formatList(text: string | null) {
    if (!text) {
      return [];
    }

    return text
      .split("\n")
      .map((item) =>
        item.replace(/^[-•]\s*/, "").trim()
      )
      .filter(Boolean);
  }

  return (
    <main className="history-page">
      <div className="history-container">

        {/* HEADER */}
        <header className="history-header">

          <div>
            <Link
              href="/dashboard"
              className="logo"
            >
              NEXA AI
            </Link>

            <p className="eyebrow">
              CAREER INTELLIGENCE
            </p>

            <h1>Analysis History</h1>

            <p className="subtitle">
              Review your previous resume analyses
              and track your career progress.
            </p>
          </div>

          <div className="header-actions">
            <Link
              href="/dashboard"
              className="secondary-button"
            >
              Dashboard
            </Link>

            <Link
              href="/analyze"
              className="primary-button"
            >
              Analyze Resume
            </Link>
          </div>

        </header>

        {/* LOADING */}
        {loading && (
          <section className="state-card">
            <div className="loader"></div>

            <h2>Loading your history...</h2>

            <p>
              Fetching your previous AI analyses.
            </p>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="state-card error-card">
            <div className="state-icon">!</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              onClick={() => {
                setLoading(true);
                setError("");
                fetchAnalyses();
              }}
              className="primary-button"
            >
              Try Again
            </button>
          </section>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          analyses.length === 0 && (
            <section className="state-card">

              <div className="state-icon">
                ✦
              </div>

              <h2>No analyses yet</h2>

              <p>
                Upload your resume and let NEXA AI
                analyze your career profile.
              </p>

              <Link
                href="/analyze"
                className="primary-button"
              >
                Analyze My Resume
              </Link>

            </section>
          )}

        {/* ANALYSIS LIST */}
        {!loading &&
          !error &&
          analyses.length > 0 && (
            <section className="history-section">

              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    YOUR RECORDS
                  </p>

                  <h2>
                    Previous Analyses
                  </h2>
                </div>

                <span className="analysis-count">
                  {analyses.length}{" "}
                  {analyses.length === 1
                    ? "Analysis"
                    : "Analyses"}
                </span>
              </div>

              <div className="analysis-list">

                {analyses.map((analysis) => (
                  <article
                    key={analysis.id}
                    className="analysis-card"
                  >

                    <div className="analysis-main">

                      <div className="analysis-info">

                        <div className="analysis-title-row">

                          <h3>
                            Resume Analysis
                          </h3>

                          <span className="analysis-id">
                            #{analysis.id}
                          </span>

                        </div>

                        <p className="resume-label">
                          Resume ID:{" "}
                          {analysis.resume_id}
                        </p>

                        <p className="analysis-date">
                          {formatDate(
                            analysis.created_at
                          )}
                        </p>

                      </div>

                      <div
                        className={`score ${getScoreClass(
                          analysis.overall_score
                        )}`}
                      >
                        <span className="score-number">
                          {analysis.overall_score !==
                          null
                            ? Math.round(
                                analysis.overall_score
                              )
                            : "--"}
                        </span>

                        <span className="score-label">
                          / 100
                        </span>
                      </div>

                    </div>

                    <div className="analysis-summary">
                      <p>
                        {analysis.summary ||
                          "No summary available."}
                      </p>
                    </div>

                    <div className="card-footer">

                      <span className="status">
                        <span className="status-dot"></span>
                        AI Analysis Complete
                      </span>

                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedAnalysis(
                            analysis
                          )
                        }
                      >
                        View Analysis →
                      </button>

                    </div>

                  </article>
                ))}

              </div>

            </section>
          )}

        {/* ANALYSIS DETAIL MODAL */}
        {selectedAnalysis && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedAnalysis(null)
            }
          >

            <div
              className="modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <p className="eyebrow">
                    NEXA AI ANALYSIS
                  </p>

                  <h2>
                    Resume Analysis #
                    {selectedAnalysis.id}
                  </h2>

                  <p className="modal-date">
                    {formatDate(
                      selectedAnalysis.created_at
                    )}
                  </p>
                </div>

                <button
                  className="close-button"
                  onClick={() =>
                    setSelectedAnalysis(null)
                  }
                >
                  ×
                </button>

              </div>

              {/* SCORE */}
              <div className="detail-score">

                <div
                  className={`large-score ${getScoreClass(
                    selectedAnalysis.overall_score
                  )}`}
                >
                  {selectedAnalysis.overall_score !==
                  null
                    ? Math.round(
                        selectedAnalysis.overall_score
                      )
                    : "--"}
                </div>

                <div>
                  <p className="detail-score-title">
                    Overall Resume Score
                  </p>

                  <p className="detail-score-text">
                    Based on technical skills,
                    projects, experience,
                    education, structure, and
                    career readiness.
                  </p>
                </div>

              </div>

              {/* SUMMARY */}
              <div className="detail-section">

                <h3>Summary</h3>

                <p>
                  {selectedAnalysis.summary ||
                    "No summary available."}
                </p>

              </div>

              {/* STRENGTHS */}
              <div className="detail-section">

                <h3>Strengths</h3>

                <ul>
                  {formatList(
                    selectedAnalysis.strengths
                  ).map((item, index) => (
                    <li key={index}>
                      <span>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

              </div>

              {/* WEAKNESSES */}
              <div className="detail-section">

                <h3>Areas for Improvement</h3>

                <ul>
                  {formatList(
                    selectedAnalysis.weaknesses
                  ).map((item, index) => (
                    <li key={index}>
                      <span>→</span>
                      {item}
                    </li>
                  ))}
                </ul>

              </div>

              {/* RECOMMENDATIONS */}
              <div className="detail-section">

                <h3>Recommendations</h3>

                <ul>
                  {formatList(
                    selectedAnalysis.recommendations
                  ).map((item, index) => (
                    <li key={index}>
                      <span>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>

              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setSelectedAnalysis(null)
                  }
                >
                  Close
                </button>

                <Link
                  href="/analyze"
                  className="primary-button"
                >
                  Analyze New Resume
                </Link>

              </div>

            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        .history-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top right,
              rgba(120, 119, 198, 0.12),
              transparent 35%
            ),
            #08090c;
          color: #f5f5f5;
          padding: 40px 24px 80px;
        }

        .history-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
          padding: 20px 0 55px;
          border-bottom: 1px solid #22252d;
        }

        .logo {
          display: inline-block;
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-decoration: none;
          margin-bottom: 30px;
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #858b99;
        }

        h1 {
          margin: 0;
          font-size: clamp(38px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .subtitle {
          max-width: 560px;
          margin: 18px 0 0;
          color: #9ca3af;
          font-size: 16px;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s ease;
          border: none;
        }

        .primary-button {
          background: #ffffff;
          color: #08090c;
        }

        .primary-button:hover {
          transform: translateY(-1px);
          background: #e8e8e8;
        }

        .secondary-button {
          background: #15171c;
          color: #ffffff;
          border: 1px solid #292d36;
        }

        .secondary-button:hover {
          background: #1d2027;
        }

        .history-section {
          padding-top: 45px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.6px;
        }

        .analysis-count {
          color: #8d93a0;
          font-size: 13px;
          font-weight: 600;
        }

        .analysis-list {
          display: grid;
          gap: 16px;
        }

        .analysis-card {
          padding: 24px;
          background: rgba(18, 20, 26, 0.92);
          border: 1px solid #252933;
          border-radius: 16px;
          transition: 0.2s ease;
        }

        .analysis-card:hover {
          border-color: #383d49;
          transform: translateY(-2px);
        }

        .analysis-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
        }

        .analysis-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .analysis-title-row h3 {
          margin: 0;
          font-size: 18px;
        }

        .analysis-id {
          padding: 4px 8px;
          border-radius: 6px;
          background: #20232b;
          color: #8f96a4;
          font-size: 11px;
          font-weight: 700;
        }

        .resume-label,
        .analysis-date {
          margin: 8px 0 0;
          color: #8f96a4;
          font-size: 13px;
        }

        .analysis-date {
          margin-top: 4px;
          color: #656b77;
        }

        .score {
          min-width: 82px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border-radius: 50%;
          background: #181b21;
          border: 1px solid #30343d;
        }

        .score-number {
          font-size: 27px;
          font-weight: 800;
          line-height: 1;
        }

        .score-label {
          margin-top: 3px;
          font-size: 10px;
          color: #7e8490;
        }

        .score-good {
          border-color: #4a9b68;
        }

        .score-good .score-number,
        .score-good.large-score {
          color: #73d895;
        }

        .score-medium {
          border-color: #a18b4c;
        }

        .score-medium .score-number,
        .score-medium.large-score {
          color: #e2c66c;
        }

        .score-low {
          border-color: #a15454;
        }

        .score-low .score-number,
        .score-low.large-score {
          color: #e27c7c;
        }

        .score-neutral {
          border-color: #30343d;
        }

        .analysis-summary {
          margin-top: 22px;
          padding: 16px;
          background: #101217;
          border-radius: 10px;
        }

        .analysis-summary p {
          margin: 0;
          color: #b4bac5;
          font-size: 14px;
          line-height: 1.6;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #777e8b;
          font-size: 12px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6fbd87;
        }

        .view-button {
          border: none;
          background: transparent;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .view-button:hover {
          text-decoration: underline;
        }

        .state-card {
          margin-top: 45px;
          padding: 70px 30px;
          text-align: center;
          background: #111319;
          border: 1px solid #252933;
          border-radius: 18px;
        }

        .state-card h2 {
          margin: 18px 0 8px;
          font-size: 23px;
        }

        .state-card p {
          max-width: 480px;
          margin: 0 auto 25px;
          color: #8d93a0;
          line-height: 1.6;
        }

        .state-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border-radius: 50%;
          background: #1b1e25;
          border: 1px solid #30343d;
          font-size: 22px;
        }

        .error-card {
          border-color: #493033;
        }

        .loader {
          width: 30px;
          height: 30px;
          margin: 0 auto;
          border: 3px solid #30343d;
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
          overflow-y: auto;
        }

        .modal {
          width: min(760px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          background: #101217;
          border: 1px solid #30343d;
          border-radius: 18px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid #252933;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.5px;
        }

        .modal-date {
          margin: 8px 0 0;
          color: #717783;
          font-size: 13px;
        }

        .close-button {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border: 1px solid #30343d;
          border-radius: 9px;
          background: #181b21;
          color: #ffffff;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .detail-score {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 25px 0;
          padding: 20px;
          border-radius: 13px;
          background: #15181e;
        }

        .large-score {
          width: 82px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #1b1e25;
          border: 1px solid #30343d;
          font-size: 30px;
          font-weight: 800;
        }

        .detail-score-title {
          margin: 0 0 5px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
        }

        .detail-score-text {
          margin: 0;
          color: #777e8b;
          font-size: 13px;
          line-height: 1.5;
        }

        .detail-section {
          padding: 22px 0;
          border-top: 1px solid #252933;
        }

        .detail-section h3 {
          margin: 0 0 12px;
          font-size: 17px;
        }

        .detail-section p {
          margin: 0;
          color: #aeb4bf;
          font-size: 14px;
          line-height: 1.7;
        }

        .detail-section ul {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .detail-section li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #aeb4bf;
          font-size: 14px;
          line-height: 1.6;
        }

        .detail-section li span {
          color: #ffffff;
          font-weight: 700;
          flex-shrink: 0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 24px;
          border-top: 1px solid #252933;
        }

        @media (max-width: 760px) {
          .history-page {
            padding: 25px 16px 60px;
          }

          .history-header {
            display: block;
          }

          .header-actions {
            margin-top: 25px;
          }

          .header-actions a {
            flex: 1;
          }

          .analysis-main {
            align-items: flex-start;
          }

          .card-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .modal {
            padding: 22px;
          }
        }

        @media (max-width: 500px) {
          .analysis-main {
            flex-direction: column-reverse;
          }

          .score {
            width: 68px;
            height: 68px;
            min-width: 68px;
          }

          .score-number {
            font-size: 22px;
          }

          .header-actions {
            flex-direction: column;
          }

          .detail-score {
            align-items: flex-start;
            flex-direction: column;
          }

          .modal-footer {
            flex-direction: column;
          }

          .modal-footer a,
          .modal-footer button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}