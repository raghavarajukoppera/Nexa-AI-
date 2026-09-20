"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JobMatch = {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  job_description: string;
  match_score: number | null;
  matched_skills: string | null;
  missing_skills: string | null;
  experience_match: number | null;
  education_match: number | null;
  summary: string | null;
  recommendations: string | null;
  created_at: string;
};

export default function JobMatchHistoryPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] =
    useState<JobMatch | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    const token = localStorage.getItem(
      "nexa_access_token"
    );

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/job-matches/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "nexa_access_token"
        );

        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load job match history"
        );
      }

      const data = await response.json();

      setMatches(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load your job match history."
      );
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

  function formatList(text: string | null) {
    if (!text) {
      return [];
    }

    return text
      .split("\n")
      .map((item) =>
        item
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  function getScoreClass(score: number | null) {
    if (score === null) {
      return "neutral";
    }

    if (score >= 80) {
      return "good";
    }

    if (score >= 60) {
      return "medium";
    }

    return "low";
  }

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}

        <header className="header">

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

            <h1>
              Job Match History
            </h1>

            <p className="subtitle">
              Review your previous job
              compatibility analyses.
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
              href="/job-match"
              className="primary-button"
            >
              New Job Match
            </Link>

          </div>

        </header>

        {/* LOADING */}

        {loading && (
          <section className="state-card">

            <div className="loader"></div>

            <h2>
              Loading job matches...
            </h2>

            <p>
              Fetching your previous
              compatibility analyses.
            </p>

          </section>
        )}

        {/* ERROR */}

        {!loading && error && (
          <section className="state-card">

            <div className="state-icon">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <button
              className="primary-button"
              onClick={() => {
                setLoading(true);
                setError("");
                loadMatches();
              }}
            >
              Try Again
            </button>

          </section>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          matches.length === 0 && (
            <section className="state-card">

              <div className="state-icon">
                ✦
              </div>

              <h2>
                No job matches yet
              </h2>

              <p>
                Compare your resume with a
                job description to see how
                well you match.
              </p>

              <Link
                href="/job-match"
                className="primary-button"
              >
                Analyze a Job
              </Link>

            </section>
          )}

        {/* MATCH LIST */}

        {!loading &&
          !error &&
          matches.length > 0 && (
            <section className="history-section">

              <div className="section-heading">

                <div>
                  <p className="eyebrow">
                    YOUR MATCHES
                  </p>

                  <h2>
                    Previous Job Analyses
                  </h2>
                </div>

                <span className="count">
                  {matches.length}{" "}
                  {matches.length === 1
                    ? "Match"
                    : "Matches"}
                </span>

              </div>

              <div className="match-list">

                {matches.map((match) => (
                  <article
                    key={match.id}
                    className="match-card"
                  >

                    <div className="match-top">

                      <div className="match-info">

                        <div className="title-row">

                          <h3>
                            {match.job_title ||
                              "Untitled Position"}
                          </h3>

                          <span className="match-id">
                            #{match.id}
                          </span>

                        </div>

                        <p className="company">
                          {match.company_name ||
                            "Company not specified"}
                        </p>

                        <p className="date">
                          {formatDate(
                            match.created_at
                          )}
                        </p>

                      </div>

                      <div
                        className={`score ${getScoreClass(
                          match.match_score
                        )}`}
                      >
                        <strong>
                          {match.match_score !==
                          null
                            ? Math.round(
                                match.match_score
                              )
                            : "--"}
                        </strong>

                        <span>
                          / 100
                        </span>
                      </div>

                    </div>

                    <div className="summary">

                      <p>
                        {match.summary ||
                          "No summary available."}
                      </p>

                    </div>

                    <div className="match-footer">

                      <div className="metrics">

                        <span>
                          Experience:{" "}
                          <strong>
                            {match.experience_match !==
                            null
                              ? Math.round(
                                  match.experience_match
                                )
                              : "--"}
                            %
                          </strong>
                        </span>

                        <span>
                          Education:{" "}
                          <strong>
                            {match.education_match !==
                            null
                              ? Math.round(
                                  match.education_match
                                )
                              : "--"}
                            %
                          </strong>
                        </span>

                      </div>

                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedMatch(match)
                        }
                      >
                        View Details →
                      </button>

                    </div>

                  </article>
                ))}

              </div>

            </section>
          )}

        {/* DETAIL MODAL */}

        {selectedMatch && (
          <div
            className="overlay"
            onClick={() =>
              setSelectedMatch(null)
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
                    NEXA AI JOB MATCH
                  </p>

                  <h2>
                    {selectedMatch.job_title ||
                      "Job Match Analysis"}
                  </h2>

                  <p className="modal-company">
                    {selectedMatch.company_name ||
                      "Company not specified"}
                  </p>

                  <p className="modal-date">
                    {formatDate(
                      selectedMatch.created_at
                    )}
                  </p>

                </div>

                <button
                  className="close-button"
                  onClick={() =>
                    setSelectedMatch(null)
                  }
                >
                  ×
                </button>

              </div>

              {/* SCORE */}

              <div className="score-detail">

                <div
                  className={`large-score ${getScoreClass(
                    selectedMatch.match_score
                  )}`}
                >
                  {selectedMatch.match_score !==
                  null
                    ? Math.round(
                        selectedMatch.match_score
                      )
                    : "--"}
                </div>

                <div>

                  <h3>
                    Overall Match Score
                  </h3>

                  <p>
                    How closely your resume
                    matches the requirements
                    of this position.
                  </p>

                </div>

              </div>

              {/* METRICS */}

              <div className="detail-metrics">

                <div>
                  <span>
                    Experience Match
                  </span>

                  <strong>
                    {selectedMatch.experience_match !==
                    null
                      ? Math.round(
                          selectedMatch.experience_match
                        )
                      : "--"}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Education Match
                  </span>

                  <strong>
                    {selectedMatch.education_match !==
                    null
                      ? Math.round(
                          selectedMatch.education_match
                        )
                      : "--"}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Resume
                  </span>

                  <strong>
                    #{selectedMatch.resume_id}
                  </strong>
                </div>

              </div>

              {/* SUMMARY */}

              <div className="detail-section">

                <h3>
                  Match Summary
                </h3>

                <p>
                  {selectedMatch.summary ||
                    "No summary available."}
                </p>

              </div>

              {/* SKILLS */}

              <div className="detail-grid">

                <div className="detail-section">

                  <h3>
                    Matched Skills
                  </h3>

                  <ul>

                    {formatList(
                      selectedMatch.matched_skills
                    ).map(
                      (skill, index) => (
                        <li key={index}>
                          <span className="check">
                            ✓
                          </span>
                          {skill}
                        </li>
                      )
                    )}

                  </ul>

                </div>

                <div className="detail-section">

                  <h3>
                    Missing Skills
                  </h3>

                  <ul>

                    {formatList(
                      selectedMatch.missing_skills
                    ).map(
                      (skill, index) => (
                        <li key={index}>
                          <span className="missing">
                            →
                          </span>
                          {skill}
                        </li>
                      )
                    )}

                  </ul>

                </div>

              </div>

              {/* RECOMMENDATIONS */}

              <div className="detail-section">

                <h3>
                  Recommendations
                </h3>

                <ul>

                  {formatList(
                    selectedMatch.recommendations
                  ).map(
                    (item, index) => (
                      <li key={index}>
                        <span className="star">
                          ✦
                        </span>
                        {item}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="modal-footer">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setSelectedMatch(null)
                  }
                >
                  Close
                </button>

                <Link
                  href="/job-match"
                  className="primary-button"
                >
                  New Job Match
                </Link>

              </div>

            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        .page {
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

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 40px;
          padding: 20px 0 45px;
          border-bottom: 1px solid #22252d;
        }

        .logo {
          display: inline-block;
          margin-bottom: 30px;
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          text-decoration: none;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #858b99;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
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
          gap: 10px;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }

        .primary-button {
          background: #ffffff;
          color: #08090c;
        }

        .secondary-button {
          background: #15171c;
          color: #ffffff;
          border: 1px solid #292d36;
        }

        .history-section {
          padding-top: 45px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 25px;
        }

        .count {
          color: #858b98;
          font-size: 13px;
        }

        .match-list {
          display: grid;
          gap: 16px;
        }

        .match-card {
          padding: 25px;
          border: 1px solid #252933;
          border-radius: 16px;
          background: #111319;
          transition: 0.2s ease;
        }

        .match-card:hover {
          border-color: #383d49;
          transform: translateY(-2px);
        }

        .match-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-row h3 {
          margin: 0;
          font-size: 19px;
        }

        .match-id {
          padding: 4px 8px;
          border-radius: 6px;
          background: #20232b;
          color: #858b98;
          font-size: 11px;
        }

        .company {
          margin: 8px 0 0;
          color: #b1b6c0;
          font-size: 14px;
        }

        .date {
          margin: 5px 0 0;
          color: #656b77;
          font-size: 12px;
        }

        .score {
          width: 82px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid #30343d;
          background: #181b21;
        }

        .score strong {
          font-size: 27px;
          line-height: 1;
        }

        .score span {
          margin-top: 3px;
          color: #737986;
          font-size: 10px;
        }

        .good {
          border-color: #4a9b68;
        }

        .good strong,
        .large-score.good {
          color: #73d895;
        }

        .medium {
          border-color: #a18b4c;
        }

        .medium strong,
        .large-score.medium {
          color: #e2c66c;
        }

        .low {
          border-color: #a15454;
        }

        .low strong,
        .large-score.low {
          color: #e27c7c;
        }

        .summary {
          margin-top: 22px;
          padding: 16px;
          border-radius: 10px;
          background: #0d0f13;
        }

        .summary p {
          margin: 0;
          color: #adb3bd;
          font-size: 14px;
          line-height: 1.65;
        }

        .match-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .metrics {
          display: flex;
          gap: 18px;
          color: #727986;
          font-size: 12px;
        }

        .metrics strong {
          color: #c9cdd4;
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
          border: 1px solid #252933;
          border-radius: 18px;
          background: #111319;
        }

        .state-card h2 {
          margin: 18px 0 8px;
          font-size: 23px;
        }

        .state-card p {
          max-width: 480px;
          margin: 0 auto 25px;
          color: #858b98;
          line-height: 1.6;
        }

        .state-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 1px solid #30343d;
          border-radius: 50%;
          background: #1b1e25;
          font-size: 22px;
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

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
        }

        .modal {
          width: min(760px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #30343d;
          border-radius: 18px;
          background: #101217;
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
        }

        .modal-company,
        .modal-date {
          margin: 7px 0 0;
          color: #858b98;
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
          cursor: pointer;
        }

        .score-detail {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 25px 0;
          padding: 20px;
          border-radius: 13px;
          background: #15181e;
        }

        .large-score {
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid #30343d;
          border-radius: 50%;
          background: #1b1e25;
          font-size: 30px;
          font-weight: 800;
        }

        .score-detail h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .score-detail p {
          margin: 0;
          color: #858b98;
          font-size: 13px;
          line-height: 1.5;
        }

        .detail-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        }

        .detail-metrics > div {
          padding: 17px;
          border: 1px solid #252933;
          border-radius: 10px;
          background: #15181e;
        }

        .detail-metrics span {
          display: block;
          color: #737986;
          font-size: 11px;
        }

        .detail-metrics strong {
          display: block;
          margin-top: 7px;
          font-size: 21px;
        }

        .detail-section {
          padding: 22px 0;
          border-top: 1px solid #252933;
        }

        .detail-section h3 {
          margin: 0 0 13px;
          font-size: 17px;
        }

        .detail-section > p {
          margin: 0;
          color: #adb3bd;
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
          gap: 10px;
          color: #adb3bd;
          font-size: 14px;
          line-height: 1.55;
        }

        .check {
          color: #73d895;
          font-weight: 800;
        }

        .missing {
          color: #e2c66c;
          font-weight: 800;
        }

        .star {
          color: #ffffff;
          font-weight: 800;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 24px;
          border-top: 1px solid #252933;
        }

        @media (max-width: 760px) {
          .page {
            padding: 25px 16px 60px;
          }

          .header {
            display: block;
          }

          .header-actions {
            margin-top: 25px;
            flex-direction: column;
          }

          .header-actions a {
            width: 100%;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .match-top {
            align-items: flex-start;
            flex-direction: column-reverse;
          }

          .score {
            width: 68px;
            height: 68px;
          }

          .score strong {
            font-size: 22px;
          }

          .match-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .metrics {
            flex-direction: column;
            gap: 7px;
          }

          .score-detail {
            align-items: flex-start;
            flex-direction: column;
          }

          .detail-metrics {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 22px;
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