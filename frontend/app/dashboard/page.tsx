"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
};

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

type JobMatch = {
  id: number;
  resume_id: number;
  job_title: string | null;
  company_name: string | null;
  match_score: number | null;
  created_at: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("nexa_access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const userResponse = await fetch(
        "http://127.0.0.1:8000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userResponse.status === 401) {
        localStorage.removeItem("nexa_access_token");
        window.location.href = "/login";
        return;
      }

      if (!userResponse.ok) {
        throw new Error("Failed to load user");
      }

      const userData = await userResponse.json();
      setUser(userData);

      const analysesResponse = await fetch(
        "http://127.0.0.1:8000/api/analyses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setAnalyses(analysesData);
      }

      const matchesResponse = await fetch(
        "http://127.0.0.1:8000/api/job-matches/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setJobMatches(matchesData);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("nexa_access_token");
    window.location.href = "/login";
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const latestAnalysis =
    analyses.length > 0 ? analyses[0] : null;

  const bestJobMatch =
    jobMatches.length > 0
      ? jobMatches.reduce((best, current) => {
          const bestScore = best.match_score ?? 0;
          const currentScore = current.match_score ?? 0;

          return currentScore > bestScore ? current : best;
        })
      : null;

  return (
    <main className="dashboard">
      <div className="container">

        {/* HEADER */}

        <header className="header">
          <div>
            <Link href="/" className="logo">
              NEXA AI
            </Link>

            <p className="eyebrow">
              CAREER INTELLIGENCE
            </p>

            <h1>Career dashboard</h1>

            {loading ? (
              <p className="welcome">
                Loading your career profile...
              </p>
            ) : (
              <p className="welcome">
                Welcome back{" "}
                <strong>{user?.name || "there"}</strong>.
              </p>
            )}
          </div>

          <div className="header-actions">
            <Link
              href="/history"
              className="secondary-button"
            >
              Resume History
            </Link>

            <Link
              href="/job-match/history"
              className="secondary-button"
            >
              Job Match History
            </Link>

            <button
              onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </header>

        {/* QUICK ACTIONS */}

        <section className="actions-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                WORKSPACE
              </p>

              <h2>Career tools</h2>
            </div>
          </div>

          <div className="action-grid">

            {/* ANALYZE RESUME */}

            <Link
              href="/analyze"
              className="action-card"
            >
              <div className="action-number">
                01
              </div>

              <div className="action-icon">
                📄
              </div>

              <h3>
                Analyze Resume
              </h3>

              <p>
                Get an AI-powered assessment
                of your resume, strengths,
                weaknesses, and improvement
                recommendations.
              </p>

              <span>
                Analyze Resume →
              </span>
            </Link>

            {/* JOB MATCH */}

            <Link
              href="/job-match"
              className="action-card"
            >
              <div className="action-number">
                02
              </div>

              <div className="action-icon">
                🎯
              </div>

              <h3>
                Match a Job
              </h3>

              <p>
                Compare your resume with a
                job description and discover
                your compatibility score.
              </p>

              <span>
                Analyze Job Match →
              </span>
            </Link>

            {/* SKILL GAP */}

            <Link
              href="/skill-gap"
              className="action-card"
            >
              <div className="action-number">
                03
              </div>

              <div className="action-icon">
                🧠
              </div>

              <h3>
                Skill Gap Analysis
              </h3>

              <p>
                Discover missing skills for
                your target role and get
                personalized learning
                recommendations.
              </p>

              <span>
                Analyze Skill Gap →
              </span>
            </Link>

            {/* RAG */}

            <Link
              href="/rag"
              className="action-card rag-card"
            >
              <div className="action-number">
                04
              </div>

              <div className="action-icon">
                ✨
              </div>

              <h3>
                Ask NEXA AI
              </h3>

              <p>
                Ask questions about your
                resume and get AI-generated
                answers grounded in your
                resume data.
              </p>

              <span>
                Ask NEXA AI →
              </span>
            </Link>

          </div>
        </section>

        {/* STATISTICS */}

        <section className="stats-grid">

          <div className="stat-card">
            <span>
              Resume Analyses
            </span>

            <strong>
              {analyses.length}
            </strong>

            <small>
              Total AI analyses
            </small>
          </div>

          <div className="stat-card">
            <span>
              Job Matches
            </span>

            <strong>
              {jobMatches.length}
            </strong>

            <small>
              Positions analyzed
            </small>
          </div>

          <div className="stat-card">
            <span>
              Latest Resume Score
            </span>

            <strong>
              {latestAnalysis?.overall_score !== null &&
              latestAnalysis?.overall_score !== undefined
                ? `${Math.round(
                    latestAnalysis.overall_score
                  )}`
                : "--"}
            </strong>

            <small>
              Out of 100
            </small>
          </div>

          <div className="stat-card">
            <span>
              Best Job Match
            </span>

            <strong>
              {bestJobMatch?.match_score !== null &&
              bestJobMatch?.match_score !== undefined
                ? `${Math.round(
                    bestJobMatch.match_score
                  )}%`
                : "--"}
            </strong>

            <small>
              Highest compatibility
            </small>
          </div>

        </section>

        {/* LATEST RESUME ANALYSIS */}

        <section className="content-section">

          <div className="section-heading">
            <div>
              <p className="eyebrow">
                RESUME INTELLIGENCE
              </p>

              <h2>
                Latest analysis
              </h2>
            </div>

            <Link
              href="/history"
              className="text-link"
            >
              View all →
            </Link>
          </div>

          {latestAnalysis ? (
            <div className="analysis-card">

              <div className="analysis-top">

                <div>
                  <h3>
                    Resume Analysis #
                    {latestAnalysis.id}
                  </h3>

                  <p>
                    {formatDate(
                      latestAnalysis.created_at
                    )}
                  </p>
                </div>

                <div className="resume-score">
                  <strong>
                    {Math.round(
                      latestAnalysis.overall_score ?? 0
                    )}
                  </strong>

                  <span>
                    / 100
                  </span>
                </div>

              </div>

              <div className="summary">
                <p>
                  {latestAnalysis.summary ||
                    "No summary available."}
                </p>
              </div>

              <div className="analysis-footer">

                <Link
                  href="/history"
                  className="secondary-button"
                >
                  View Full Analysis
                </Link>

                <Link
                  href="/analyze"
                  className="primary-button"
                >
                  Analyze Another Resume
                </Link>

              </div>

            </div>
          ) : (
            <div className="empty-card">

              <div className="empty-icon">
                ✦
              </div>

              <h3>
                Your career intelligence
                starts here
              </h3>

              <p>
                Upload your resume and let
                NEXA AI analyze your skills,
                experience, and career
                readiness.
              </p>

              <Link
                href="/analyze"
                className="primary-button"
              >
                Analyze My Resume
              </Link>

            </div>
          )}

        </section>

        {/* BEST JOB MATCH */}

        <section className="content-section">

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                JOB INTELLIGENCE
              </p>

              <h2>
                Best job match
              </h2>
            </div>

            <Link
              href="/job-match/history"
              className="text-link"
            >
              View all →
            </Link>

          </div>

          {bestJobMatch ? (
            <div className="job-card">

              <div className="job-info">

                <p className="job-label">
                  HIGHEST COMPATIBILITY
                </p>

                <h3>
                  {bestJobMatch.job_title ||
                    "Untitled Position"}
                </h3>

                <p className="company">
                  {bestJobMatch.company_name ||
                    "Company not specified"}
                </p>

                <p className="job-date">
                  Analyzed{" "}
                  {formatDate(
                    bestJobMatch.created_at
                  )}
                </p>

              </div>

              <div className="job-score">

                <strong>
                  {Math.round(
                    bestJobMatch.match_score ?? 0
                  )}
                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>
          ) : (
            <div className="empty-card compact">

              <div>
                <h3>
                  No job matches yet
                </h3>

                <p>
                  Compare your resume against
                  a job description to discover
                  your compatibility.
                </p>
              </div>

              <Link
                href="/job-match"
                className="primary-button"
              >
                Match a Job →
              </Link>

            </div>
          )}

        </section>

        {/* RAG FEATURE */}

        <section className="content-section">

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                AI CAREER ASSISTANT
              </p>

              <h2>
                Ask NEXA AI
              </h2>
            </div>

            <Link
              href="/rag"
              className="text-link"
            >
              Open RAG →
            </Link>

          </div>

          <div className="rag-banner">

            <div className="rag-banner-icon">
              ✨
            </div>

            <div className="rag-banner-content">

              <h3>
                Your resume, now conversational
              </h3>

              <p>
                Ask NEXA AI questions about your
                skills, experience, technologies,
                projects, strengths, and career
                profile. Responses are grounded
                in your resume information.
              </p>

            </div>

            <Link
              href="/rag"
              className="primary-button"
            >
              Ask NEXA AI →
            </Link>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="footer">

          <span>
            NEXA AI
          </span>

          <span>
            AI-powered career intelligence
          </span>

        </footer>

      </div>

      <style jsx>{`

        .dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top right,
              rgba(120, 119, 198, 0.12),
              transparent 35%
            ),
            #08090c;
          color: #f5f5f5;
          padding: 40px 24px 70px;
        }

        .container {
          max-width: 1150px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 35px;
          padding: 20px 0 42px;
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
          font-size: clamp(38px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .welcome {
          margin: 16px 0 0;
          color: #8f96a4;
          font-size: 15px;
        }

        .welcome strong {
          color: #ffffff;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 9px;
        }

        .primary-button,
        .secondary-button,
        .logout-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 0 17px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .primary-button {
          border: 1px solid #ffffff;
          background: #ffffff;
          color: #08090c;
        }

        .primary-button:hover {
          background: #e9e9e9;
        }

        .secondary-button {
          border: 1px solid #292d36;
          background: #15171c;
          color: #ffffff;
        }

        .secondary-button:hover {
          background: #1d2027;
        }

        .logout-button {
          border: 1px solid #3a3032;
          background: #171315;
          color: #d98c8c;
        }

        .logout-button:hover {
          background: #21191b;
        }

        .actions-section {
          padding-top: 42px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.6px;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .action-card {
          position: relative;
          display: block;
          padding: 27px;
          min-height: 270px;
          border: 1px solid #252933;
          border-radius: 16px;
          background: #111319;
          color: #ffffff;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-2px);
          border-color: #3a3f4b;
          background: #13161c;
        }

        .rag-card:hover {
          border-color: #5751a8;
        }

        .action-number {
          color: #666d79;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .action-icon {
          margin-top: 22px;
          font-size: 28px;
        }

        .action-card h3 {
          margin: 13px 0 9px;
          font-size: 22px;
          letter-spacing: -0.5px;
        }

        .action-card p {
          max-width: 470px;
          margin: 0;
          color: #858b98;
          font-size: 14px;
          line-height: 1.65;
        }

        .action-card > span {
          display: block;
          margin-top: 20px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 15px;
        }

        .stat-card {
          padding: 20px;
          border: 1px solid #252933;
          border-radius: 13px;
          background: #101217;
        }

        .stat-card span {
          display: block;
          color: #777e8b;
          font-size: 11px;
          font-weight: 600;
        }

        .stat-card strong {
          display: block;
          margin-top: 9px;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .stat-card small {
          display: block;
          margin-top: 4px;
          color: #555c68;
          font-size: 11px;
        }

        .content-section {
          padding-top: 45px;
        }

        .text-link {
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        .analysis-card,
        .job-card,
        .empty-card {
          border: 1px solid #252933;
          border-radius: 16px;
          background: #111319;
        }

        .analysis-card {
          padding: 25px;
        }

        .analysis-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .analysis-top h3 {
          margin: 0;
          font-size: 18px;
        }

        .analysis-top p {
          margin: 7px 0 0;
          color: #656b77;
          font-size: 12px;
        }

        .resume-score {
          min-width: 78px;
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          border: 1px solid #4a9b68;
          border-radius: 50%;
          background: #181b21;
        }

        .resume-score strong {
          color: #73d895;
          font-size: 25px;
        }

        .resume-score span {
          color: #6d7480;
          font-size: 10px;
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

        .analysis-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .job-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 25px;
        }

        .job-label {
          margin: 0 0 9px;
          color: #73d895;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .job-info h3 {
          margin: 0;
          font-size: 21px;
        }

        .company {
          margin: 7px 0 0;
          color: #aeb4bf;
          font-size: 14px;
        }

        .job-date {
          margin: 5px 0 0;
          color: #606773;
          font-size: 12px;
        }

        .job-score {
          width: 92px;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          flex-shrink: 0;
          border: 1px solid #4a9b68;
          border-radius: 50%;
          background: #181b21;
        }

        .job-score strong {
          color: #73d895;
          font-size: 28px;
        }

        .job-score span {
          color: #6d7480;
          font-size: 10px;
        }

        .empty-card {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 60px 30px;
          text-align: center;
        }

        .empty-card.compact {
          align-items: center;
          justify-content: space-between;
          flex-direction: row;
          padding: 28px;
          text-align: left;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #30343d;
          border-radius: 50%;
          background: #1b1e25;
          font-size: 20px;
        }

        .empty-card h3 {
          margin: 18px 0 8px;
          font-size: 20px;
        }

        .empty-card p {
          max-width: 500px;
          margin: 0 0 23px;
          color: #858b98;
          font-size: 14px;
          line-height: 1.6;
        }

        .empty-card.compact h3 {
          margin: 0 0 7px;
        }

        .empty-card.compact p {
          margin: 0;
        }

        .rag-banner {
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 27px;
          border: 1px solid #30304a;
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              #12131c,
              #101118
            );
        }

        .rag-banner-icon {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #45436d;
          border-radius: 14px;
          background: #1b1a2d;
          font-size: 25px;
        }

        .rag-banner-content {
          flex: 1;
        }

        .rag-banner-content h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .rag-banner-content p {
          margin: 0;
          color: #858b98;
          font-size: 14px;
          line-height: 1.6;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          margin-top: 70px;
          padding-top: 20px;
          border-top: 1px solid #22252d;
          color: #555c68;
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .header {
            display: block;
          }

          .header-actions {
            justify-content: flex-start;
            margin-top: 25px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .rag-banner {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .dashboard {
            padding: 25px 16px 60px;
          }

          .action-grid,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .header-actions,
          .analysis-footer {
            flex-direction: column;
          }

          .header-actions a,
          .header-actions button,
          .analysis-footer a {
            width: 100%;
          }

          .job-card,
          .empty-card.compact {
            align-items: flex-start;
            flex-direction: column;
          }

          .rag-banner {
            padding: 22px;
          }

          .rag-banner .primary-button {
            width: 100%;
          }

          .footer {
            flex-direction: column;
            gap: 8px;
          }
        }

      `}</style>
    </main>
  );
}