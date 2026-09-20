"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resume = {
  id: number;
  filename: string;
};

type SkillGapResult = {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  overall_skill_match: number | null;
  existing_skills: string | null;
  missing_skills: string | null;
  high_priority_skills: string | null;
  learning_recommendations: string | null;
  summary: string | null;
  created_at: string;
};

export default function SkillGapPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] =
    useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState<SkillGapResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

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
          "Unable to load resumes"
        );
      }

      const data = await response.json();

      setResumes(data);

      if (data.length > 0) {
        setSelectedResume(
          String(data[0].id)
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load your resumes."
      );
    }
  }

  async function analyzeSkillGap() {
    setError("");
    setResult(null);

    if (!selectedResume) {
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
        "Job description must contain at least 50 characters."
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

    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/skill-gaps/resume/${selectedResume}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            resume_id:
              Number(selectedResume),

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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Skill gap analysis failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatSkills(
    value: string | null
  ) {
    if (!value) {
      return [];
    }

    return value
      .split("\n")
      .map((item) =>
        item
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  return (
    <main className="page">

      <div className="container">

        {/* HEADER */}

        <header className="header">

          <div>

            <Link
              href="/dashboard"
              className="back"
            >
              ← Dashboard
            </Link>

            <p className="eyebrow">
              NEXA AI / CAREER INTELLIGENCE
            </p>

            <h1>
              Skill Gap Analysis
            </h1>

            <p className="subtitle">
              Discover which skills you already
              have, which skills you are missing,
              and what you should learn next.
            </p>

          </div>

        </header>

        {/* FORM */}

        {!result && (
          <section className="workspace">

            <div className="form-card">

              <div className="section-title">

                <span>
                  01
                </span>

                <div>
                  <h2>
                    Select your resume
                  </h2>

                  <p>
                    Choose the resume you want
                    to compare against the job.
                  </p>
                </div>

              </div>

              {resumes.length === 0 ? (

                <div className="empty-resume">

                  <p>
                    No resumes found.
                  </p>

                  <Link
                    href="/analyze"
                    className="primary-button"
                  >
                    Upload Resume
                  </Link>

                </div>

              ) : (

                <select
                  value={selectedResume}
                  onChange={(e) =>
                    setSelectedResume(
                      e.target.value
                    )
                  }
                  className="input"
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

              )}

            </div>

            <div className="form-card">

              <div className="section-title">

                <span>
                  02
                </span>

                <div>
                  <h2>
                    Job information
                  </h2>

                  <p>
                    Add the position you want
                    to evaluate.
                  </p>
                </div>

              </div>

              <div className="two-columns">

                <input
                  className="input"
                  type="text"
                  placeholder="Job title"
                  value={jobTitle}
                  onChange={(e) =>
                    setJobTitle(
                      e.target.value
                    )
                  }
                />

                <input
                  className="input"
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(
                      e.target.value
                    )
                  }
                />

              </div>

              <textarea
                className="textarea"
                placeholder="Paste the complete job description here..."
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(
                    e.target.value
                  )
                }
              />

              <div className="form-footer">

                <span>
                  {jobDescription.length} characters
                </span>

                <button
                  onClick={analyzeSkillGap}
                  disabled={loading}
                  className="primary-button"
                >
                  {loading
                    ? "Analyzing..."
                    : "Analyze Skill Gap →"}
                </button>

              </div>

            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

          </section>
        )}

        {/* RESULT */}

        {result && (

          <section className="results">

            {/* SCORE */}

            <div className="result-header">

              <div>

                <p className="eyebrow">
                  ANALYSIS COMPLETE
                </p>

                <h2>
                  {result.job_title ||
                    "Job Skill Analysis"}
                </h2>

                {result.company_name && (
                  <p className="company">
                    {result.company_name}
                  </p>
                )}

              </div>

              <div className="score">

                <strong>
                  {Math.round(
                    result.overall_skill_match ??
                      0
                  )}
                </strong>

                <span>
                  / 100
                </span>

                <small>
                  Skill Match
                </small>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="summary-card">

              <p className="eyebrow">
                AI ASSESSMENT
              </p>

              <p className="summary">
                {result.summary ||
                  "No summary available."}
              </p>

            </div>

            {/* SKILL GRID */}

            <div className="skill-grid">

              <div className="skill-card">

                <p className="card-label">
                  EXISTING SKILLS
                </p>

                <h3>
                  What you already have
                </h3>

                <div className="skills">

                  {formatSkills(
                    result.existing_skills
                  ).map(
                    (skill, index) => (
                      <span
                        className="skill existing"
                        key={index}
                      >
                        ✓ {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              <div className="skill-card">

                <p className="card-label">
                  MISSING SKILLS
                </p>

                <h3>
                  Skills to develop
                </h3>

                <div className="skills">

                  {formatSkills(
                    result.missing_skills
                  ).map(
                    (skill, index) => (
                      <span
                        className="skill missing"
                        key={index}
                      >
                        + {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              <div className="skill-card priority">

                <p className="card-label">
                  HIGH PRIORITY
                </p>

                <h3>
                  Learn these first
                </h3>

                <div className="skills">

                  {formatSkills(
                    result.high_priority_skills
                  ).map(
                    (skill, index) => (
                      <span
                        className="skill priority-skill"
                        key={index}
                      >
                        ! {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* LEARNING PLAN */}

            <div className="learning-card">

              <div>

                <p className="eyebrow">
                  RECOMMENDED LEARNING PLAN
                </p>

                <h2>
                  What to work on next
                </h2>

              </div>

              <div className="recommendations">

                {formatSkills(
                  result.learning_recommendations
                ).map(
                  (recommendation, index) => (
                    <div
                      className="recommendation"
                      key={index}
                    >

                      <span>
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <p>
                        {recommendation}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="result-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setResult(null)
                }
              >
                ← Analyze Another Job
              </button>

              <Link
                href="/dashboard"
                className="primary-button"
              >
                Back to Dashboard
              </Link>

            </div>

          </section>

        )}

      </div>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #08090c;
          color: #f5f5f5;
          padding: 35px 24px 80px;
        }

        .container {
          max-width: 1050px;
          margin: auto;
        }

        .header {
          padding: 10px 0 40px;
          border-bottom: 1px solid #242730;
        }

        .back {
          display: inline-block;
          margin-bottom: 35px;
          color: #858b98;
          font-size: 13px;
          text-decoration: none;
        }

        .back:hover {
          color: white;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #777e8b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h1 {
          margin: 0;
          font-size: clamp(40px, 6vw, 65px);
          line-height: 0.95;
          letter-spacing: -3px;
        }

        .subtitle {
          max-width: 650px;
          margin: 20px 0 0;
          color: #858b98;
          font-size: 15px;
          line-height: 1.7;
        }

        .workspace {
          display: grid;
          gap: 15px;
          margin-top: 35px;
        }

        .form-card {
          padding: 28px;
          border: 1px solid #252933;
          border-radius: 16px;
          background: #111319;
        }

        .section-title {
          display: flex;
          gap: 18px;
          margin-bottom: 25px;
        }

        .section-title > span {
          color: #626976;
          font-size: 11px;
          font-weight: 800;
        }

        .section-title h2 {
          margin: 0;
          font-size: 19px;
        }

        .section-title p {
          margin: 7px 0 0;
          color: #737a87;
          font-size: 13px;
        }

        .input,
        .textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #292d36;
          border-radius: 9px;
          outline: none;
          background: #0c0e12;
          color: white;
          font: inherit;
        }

        .input {
          height: 48px;
          padding: 0 14px;
          font-size: 13px;
        }

        .textarea {
          min-height: 250px;
          margin-top: 14px;
          padding: 15px;
          resize: vertical;
          font-size: 13px;
          line-height: 1.6;
        }

        .input:focus,
        .textarea:focus {
          border-color: #5e6470;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 15px;
        }

        .form-footer span {
          color: #555c68;
          font-size: 11px;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 45px;
          padding: 0 18px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }

        .primary-button {
          border: 1px solid white;
          background: white;
          color: #08090c;
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .secondary-button {
          border: 1px solid #292d36;
          background: #15171c;
          color: white;
        }

        .error {
          padding: 14px 16px;
          border: 1px solid #533337;
          border-radius: 9px;
          background: #1b1113;
          color: #e59a9a;
          font-size: 13px;
        }

        .results {
          margin-top: 35px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          padding: 25px 0 35px;
        }

        .result-header h2 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -1px;
        }

        .company {
          margin: 7px 0 0;
          color: #888f9b;
        }

        .score {
          width: 125px;
          height: 125px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          flex-shrink: 0;
          border: 1px solid #4a9b68;
          border-radius: 50%;
          background: #111319;
        }

        .score strong {
          color: #73d895;
          font-size: 40px;
          line-height: 1;
        }

        .score span {
          color: #69717d;
          font-size: 11px;
        }

        .score small {
          margin-top: 7px;
          color: #8c939e;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .summary-card,
        .skill-card,
        .learning-card {
          border: 1px solid #252933;
          border-radius: 16px;
          background: #111319;
        }

        .summary-card {
          padding: 25px;
        }

        .summary {
          max-width: 850px;
          margin: 0;
          color: #b0b6c0;
          font-size: 15px;
          line-height: 1.7;
        }

        .skill-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 14px;
        }

        .skill-card {
          min-height: 230px;
          padding: 24px;
        }

        .card-label {
          margin: 0 0 10px;
          color: #777e8b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .skill-card h3 {
          margin: 0 0 20px;
          font-size: 18px;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .skill {
          padding: 7px 10px;
          border: 1px solid #2c3038;
          border-radius: 6px;
          background: #181b21;
          color: #b7bdc7;
          font-size: 11px;
        }

        .existing {
          border-color: #31563d;
          color: #8dd6a5;
        }

        .missing {
          border-color: #5a4430;
          color: #d8a76e;
        }

        .priority-skill {
          border-color: #5b3539;
          color: #df9696;
        }

        .learning-card {
          margin-top: 14px;
          padding: 28px;
        }

        .learning-card h2 {
          margin: 0 0 25px;
          font-size: 23px;
        }

        .recommendations {
          display: grid;
          gap: 1px;
          border-top: 1px solid #292d36;
        }

        .recommendation {
          display: flex;
          gap: 18px;
          padding: 17px 0;
          border-bottom: 1px solid #292d36;
        }

        .recommendation span {
          color: #606773;
          font-size: 11px;
          font-weight: 800;
        }

        .recommendation p {
          margin: 0;
          color: #aeb4be;
          font-size: 13px;
          line-height: 1.6;
        }

        .result-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 25px;
        }

        .empty-resume {
          padding: 25px;
          border: 1px dashed #343943;
          border-radius: 10px;
          text-align: center;
        }

        .empty-resume p {
          color: #858b98;
          font-size: 13px;
        }

        @media (max-width: 800px) {
          .skill-grid {
            grid-template-columns: 1fr;
          }

          .result-header {
            align-items: flex-start;
            flex-direction: column-reverse;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 25px 16px 60px;
          }

          .two-columns {
            grid-template-columns: 1fr;
          }

          .form-footer,
          .result-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .form-footer .primary-button,
          .result-actions a,
          .result-actions button {
            width: 100%;
          }

          .result-header h2 {
            font-size: 27px;
          }
        }

      `}</style>

    </main>
  );
}