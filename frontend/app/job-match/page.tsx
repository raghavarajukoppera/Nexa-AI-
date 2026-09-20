"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resume = {
  id: number;
  filename: string;
};

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

export default function JobMatchPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [result, setResult] = useState<JobMatch | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    const token = localStorage.getItem(
      "nexa_access_token"
    );

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/resumes/",
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
          "Failed to load resumes"
        );
      }

      const data = await response.json();

      setResumes(data);

      if (data.length > 0) {
        setResumeId(String(data[0].id));
      }
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load your resumes."
      );
    } finally {
      setLoadingResumes(false);
    }
  }

  async function handleMatch() {
    setError("");
    setResult(null);

    const token = localStorage.getItem(
      "nexa_access_token"
    );

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!resumeId) {
      setError(
        "Please select a resume."
      );
      return;
    }

    if (!jobDescription.trim()) {
      setError(
        "Please enter a job description."
      );
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError(
        "Please enter a more detailed job description."
      );
      return;
    }

    setAnalyzing(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/job-matches/resume/${resumeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resume_id: Number(resumeId),
            job_title:
              jobTitle.trim() || null,
            company_name:
              companyName.trim() || null,
            job_description:
              jobDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "nexa_access_token"
        );

        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Job matching failed"
        );
      }

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Job matching failed."
      );
    } finally {
      setAnalyzing(false);
    }
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

  function getScoreClass(
    score: number | null
  ) {
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

  function resetMatch() {
    setResult(null);
    setError("");
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
              Job Match
            </h1>

            <p className="subtitle">
              Compare your resume against a
              job description and discover
              how well you match the role.
            </p>
          </div>

          <div className="header-links">

            <Link
              href="/dashboard"
              className="secondary-button"
            >
              Dashboard
            </Link>

            <Link
              href="/history"
              className="secondary-button"
            >
              History
            </Link>

          </div>

        </header>

        {/* RESULT */}

        {result ? (
          <section className="result-section">

            <div className="result-header">

              <div>
                <p className="eyebrow">
                  MATCH COMPLETE
                </p>

                <h2>
                  {result.job_title ||
                    "Job Match Analysis"}
                </h2>

                {result.company_name && (
                  <p className="company">
                    {result.company_name}
                  </p>
                )}
              </div>

              <button
                onClick={resetMatch}
                className="secondary-button"
              >
                New Match
              </button>

            </div>

            {/* SCORE */}

            <div className="score-card">

              <div
                className={`score-circle ${getScoreClass(
                  result.match_score
                )}`}
              >
                <span>
                  {result.match_score !==
                  null
                    ? Math.round(
                        result.match_score
                      )
                    : "--"}
                </span>

                <small>/ 100</small>
              </div>

              <div className="score-content">

                <p className="score-title">
                  Overall Job Match
                </p>

                <p className="score-description">
                  This score represents how
                  closely your resume matches
                  the requirements of this
                  position.
                </p>

              </div>

            </div>

            {/* METRICS */}

            <div className="metrics">

              <div className="metric-card">

                <span>
                  Experience Match
                </span>

                <strong>
                  {result.experience_match !==
                  null
                    ? Math.round(
                        result.experience_match
                      )
                    : "--"}
                  %
                </strong>

              </div>

              <div className="metric-card">

                <span>
                  Education Match
                </span>

                <strong>
                  {result.education_match !==
                  null
                    ? Math.round(
                        result.education_match
                      )
                    : "--"}
                  %
                </strong>

              </div>

              <div className="metric-card">

                <span>
                  Resume
                </span>

                <strong>
                  #{result.resume_id}
                </strong>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="result-card">

              <h3>
                Match Summary
              </h3>

              <p>
                {result.summary ||
                  "No summary available."}
              </p>

            </div>

            {/* SKILLS */}

            <div className="two-column">

              <div className="result-card">

                <h3>
                  Matched Skills
                </h3>

                {formatList(
                  result.matched_skills
                ).length > 0 ? (
                  <ul>
                    {formatList(
                      result.matched_skills
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
                ) : (
                  <p>
                    No matched skills found.
                  </p>
                )}

              </div>

              <div className="result-card">

                <h3>
                  Missing Skills
                </h3>

                {formatList(
                  result.missing_skills
                ).length > 0 ? (
                  <ul>
                    {formatList(
                      result.missing_skills
                    ).map(
                      (skill, index) => (
                        <li key={index}>
                          <span className="arrow">
                            →
                          </span>
                          {skill}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    No major missing skills
                    identified.
                  </p>
                )}

              </div>

            </div>

            {/* RECOMMENDATIONS */}

            <div className="result-card">

              <h3>
                Recommendations
              </h3>

              {formatList(
                result.recommendations
              ).length > 0 ? (
                <ul>
                  {formatList(
                    result.recommendations
                  ).map(
                    (recommendation, index) => (
                      <li key={index}>
                        <span className="star">
                          ✦
                        </span>
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No recommendations
                  available.
                </p>
              )}

            </div>

          </section>
        ) : (
          /* FORM */

          <section className="form-section">

            <div className="form-card">

              <div className="form-heading">

                <p className="eyebrow">
                  STEP 01
                </p>

                <h2>
                  Select your resume
                </h2>

                <p>
                  Choose the resume you want
                  NEXA AI to compare against
                  the job.
                </p>

              </div>

              {loadingResumes ? (
                <div className="loading">
                  Loading your resumes...
                </div>
              ) : resumes.length === 0 ? (
                <div className="empty">

                  <p>
                    You don't have any
                    resumes yet.
                  </p>

                  <Link
                    href="/analyze"
                    className="primary-button"
                  >
                    Upload Resume
                  </Link>

                </div>
              ) : (
                <>
                  <label>
                    Resume
                  </label>

                  <select
                    value={resumeId}
                    onChange={(event) =>
                      setResumeId(
                        event.target.value
                      )
                    }
                  >
                    {resumes.map(
                      (resume) => (
                        <option
                          key={resume.id}
                          value={resume.id}
                        >
                          {resume.filename}
                        </option>
                      )
                    )}
                  </select>

                  <div className="form-heading second">

                    <p className="eyebrow">
                      STEP 02
                    </p>

                    <h2>
                      Job details
                    </h2>

                    <p>
                      Add optional information
                      about the position.
                    </p>

                  </div>

                  <label>
                    Job Title
                    <span>
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. AI/ML Engineer"
                    value={jobTitle}
                    onChange={(event) =>
                      setJobTitle(
                        event.target.value
                      )
                    }
                  />

                  <label>
                    Company Name
                    <span>
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(
                        event.target.value
                      )
                    }
                  />

                  <label>
                    Job Description
                    <span>
                      Required
                    </span>
                  </label>

                  <textarea
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(
                        event.target.value
                      )
                    }
                    rows={12}
                  />

                  <div className="character-count">
                    {jobDescription.length}{" "}
                    characters
                  </div>

                  {error && (
                    <div className="error">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleMatch}
                    disabled={analyzing}
                    className="analyze-button"
                  >
                    {analyzing
                      ? "Analyzing Job Match..."
                      : "Analyze Job Match →"}
                  </button>
                </>
              )}

            </div>

            {/* INFO PANEL */}

            <aside className="info-panel">

              <p className="eyebrow">
                WHAT NEXA AI CHECKS
              </p>

              <h2>
                Understand your
                compatibility.
              </h2>

              <div className="info-item">
                <span>01</span>
                <div>
                  <strong>
                    Skill Alignment
                  </strong>
                  <p>
                    Identify skills that match
                    the requirements and skills
                    you may be missing.
                  </p>
                </div>
              </div>

              <div className="info-item">
                <span>02</span>
                <div>
                  <strong>
                    Experience Fit
                  </strong>
                  <p>
                    Compare your demonstrated
                    experience with the role's
                    expectations.
                  </p>
                </div>
              </div>

              <div className="info-item">
                <span>03</span>
                <div>
                  <strong>
                    Career Recommendations
                  </strong>
                  <p>
                    Get actionable suggestions
                    to improve your application.
                  </p>
                </div>
              </div>

            </aside>

          </section>
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
          letter-spacing: -0.5px;
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
          font-size: clamp(40px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .subtitle {
          max-width: 580px;
          margin: 18px 0 0;
          color: #9ca3af;
          font-size: 16px;
          line-height: 1.6;
        }

        .header-links {
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

        .form-section {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(
            280px,
            0.75fr
          );
          gap: 20px;
          padding-top: 40px;
        }

        .form-card,
        .info-panel,
        .result-card,
        .score-card,
        .metric-card {
          background: #111319;
          border: 1px solid #252933;
          border-radius: 16px;
        }

        .form-card {
          padding: 30px;
        }

        .form-heading h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.7px;
        }

        .form-heading p:not(.eyebrow) {
          margin: 9px 0 25px;
          color: #858b98;
          font-size: 14px;
          line-height: 1.6;
        }

        .form-heading.second {
          margin-top: 38px;
          padding-top: 30px;
          border-top: 1px solid #252933;
        }

        label {
          display: flex;
          justify-content: space-between;
          margin: 18px 0 8px;
          color: #d8dbe1;
          font-size: 13px;
          font-weight: 700;
        }

        label span {
          color: #686f7b;
          font-size: 11px;
          font-weight: 500;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #2b2f38;
          border-radius: 9px;
          background: #0b0d11;
          color: #ffffff;
          outline: none;
          font-family: inherit;
          font-size: 14px;
        }

        input,
        select {
          height: 46px;
          padding: 0 13px;
        }

        textarea {
          resize: vertical;
          min-height: 240px;
          padding: 13px;
          line-height: 1.6;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #656b78;
        }

        .character-count {
          margin-top: 7px;
          text-align: right;
          color: #5e6470;
          font-size: 11px;
        }

        .analyze-button {
          width: 100%;
          min-height: 50px;
          margin-top: 20px;
          border: none;
          border-radius: 10px;
          background: #ffffff;
          color: #08090c;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .analyze-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .error {
          margin-top: 15px;
          padding: 12px 14px;
          border: 1px solid #553438;
          border-radius: 9px;
          background: #1d1214;
          color: #e89a9a;
          font-size: 13px;
        }

        .loading,
        .empty {
          padding: 30px 0;
          color: #858b98;
          text-align: center;
        }

        .info-panel {
          height: fit-content;
          padding: 28px;
        }

        .info-panel h2 {
          margin: 0 0 30px;
          font-size: 27px;
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .info-item {
          display: flex;
          gap: 14px;
          padding: 18px 0;
          border-top: 1px solid #252933;
        }

        .info-item > span {
          color: #666d79;
          font-size: 11px;
          font-weight: 800;
        }

        .info-item strong {
          font-size: 14px;
        }

        .info-item p {
          margin: 7px 0 0;
          color: #777e8b;
          font-size: 13px;
          line-height: 1.55;
        }

        /* RESULT */

        .result-section {
          padding-top: 40px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-bottom: 25px;
        }

        .result-header h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .company {
          margin: 7px 0 0;
          color: #858b98;
          font-size: 14px;
        }

        .score-card {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 25px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          flex-shrink: 0;
          border: 2px solid #343943;
          border-radius: 50%;
          background: #181b21;
        }

        .score-circle span {
          font-size: 38px;
          font-weight: 800;
          line-height: 1;
        }

        .score-circle small {
          margin-top: 5px;
          color: #777e8b;
          font-size: 11px;
        }

        .score-circle.good {
          border-color: #4a9b68;
        }

        .score-circle.good span {
          color: #73d895;
        }

        .score-circle.medium {
          border-color: #a18b4c;
        }

        .score-circle.medium span {
          color: #e2c66c;
        }

        .score-circle.low {
          border-color: #a15454;
        }

        .score-circle.low span {
          color: #e27c7c;
        }

        .score-title {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 800;
        }

        .score-description {
          max-width: 600px;
          margin: 0;
          color: #858b98;
          font-size: 14px;
          line-height: 1.6;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 15px 0;
        }

        .metric-card {
          padding: 20px;
        }

        .metric-card span {
          display: block;
          color: #777e8b;
          font-size: 12px;
        }

        .metric-card strong {
          display: block;
          margin-top: 8px;
          font-size: 24px;
        }

        .result-card {
          margin-top: 15px;
          padding: 25px;
        }

        .result-card h3 {
          margin: 0 0 14px;
          font-size: 17px;
        }

        .result-card > p {
          margin: 0;
          color: #adb3bd;
          font-size: 14px;
          line-height: 1.7;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .result-card ul {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .result-card li {
          display: flex;
          gap: 10px;
          color: #adb3bd;
          font-size: 14px;
          line-height: 1.55;
        }

        .check,
        .star {
          color: #73d895;
          font-weight: 800;
        }

        .arrow {
          color: #e2c66c;
          font-weight: 800;
        }

        @media (max-width: 800px) {
          .header {
            display: block;
          }

          .header-links {
            margin-top: 25px;
          }

          .form-section {
            grid-template-columns: 1fr;
          }

          .info-panel {
            order: -1;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 25px 16px 60px;
          }

          .form-card,
          .info-panel,
          .result-card,
          .score-card {
            padding: 20px;
          }

          .metrics,
          .two-column {
            grid-template-columns: 1fr;
          }

          .score-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .result-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-links {
            flex-direction: column;
          }

          .header-links a {
            width: 100%;
          }
        }
      `}
      </style>
    </main>
  );
}