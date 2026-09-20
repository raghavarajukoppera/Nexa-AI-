"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-[-200px] left-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[140px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
            <span className="text-sm font-semibold">N</span>
          </div>

          <span className="text-lg font-semibold tracking-tight">
            NEXA <span className="text-white/40">AI</span>
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>

          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>

          <a href="#about" className="transition hover:text-white">
            About
          </a>
        </div>

        <button
          onClick={() => router.push("/analyze")}
          className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center">
        {/* AI Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
          AI-powered career intelligence
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
          Meet your
          <br />
          <span className="bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            intelligent career assistant.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
          NEXA AI analyzes your resume, understands job requirements, identifies
          skill gaps, and gives you personalized career intelligence.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={() => router.push("/analyze")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02]"
          >
            Analyze My Resume

            <span
              className={`transition-transform duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
            >
              →
            </span>
          </button>

          <button className="rounded-full border border-white/10 px-7 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white">
            Explore NEXA
          </button>
        </div>

        {/* Assistant Preview */}
        <div className="mt-20 w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-1 shadow-2xl shadow-black">
            <div className="rounded-[22px] border border-white/[0.06] bg-[#090909] p-6 sm:p-8">
              {/* Window Header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>

                <span className="text-xs text-white/30">
                  NEXA Intelligence
                </span>
              </div>

              {/* AI Message */}
              <div className="flex gap-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
                  N
                </div>

                <div>
                  <p className="text-sm font-medium text-white/80">
                    NEXA AI
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                    I've analyzed your resume against the selected position.
                    Your overall compatibility score is
                    <span className="mx-1 font-semibold text-white">
                      87%.
                    </span>
                    I also found 3 skills that could improve your match.
                  </p>
                </div>
              </div>

              {/* Analysis Cards */}
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-xs text-white/30">Resume Match</p>
                  <p className="mt-2 text-2xl font-semibold">87%</p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-xs text-white/30">Skills Matched</p>
                  <p className="mt-2 text-2xl font-semibold">24</p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-xs text-white/30">Skill Gaps</p>
                  <p className="mt-2 text-2xl font-semibold">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 border-t border-white/[0.06] px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-white/30">CAPABILITIES</p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Intelligence built around your career.
            </h2>

            <p className="mt-5 leading-7 text-white/40">
              NEXA combines AI analysis, semantic search, and your career
              context to provide more useful recommendations.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Feature
              number="01"
              title="Resume Intelligence"
              description="Understand your resume beyond keywords, including experience, skills, projects, and career strengths."
            />

            <Feature
              number="02"
              title="Job Matching"
              description="Compare your profile with job requirements and discover where you stand."
            />

            <Feature
              number="03"
              title="Skill Intelligence"
              description="Identify missing skills and generate personalized recommendations for closing your skill gaps."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 text-sm text-white/30 sm:flex-row">
          <span>© 2026 NEXA AI</span>
          <span>Your Intelligent Career Assistant</span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-3xl border border-white/[0.07] bg-white/[0.02] p-7 transition hover:border-white/[0.14] hover:bg-white/[0.035]">
      <span className="text-xs text-white/25">{number}</span>

      <h3 className="mt-12 text-xl font-medium">{title}</h3>

      <p className="mt-4 text-sm leading-6 text-white/40">{description}</p>
    </div>
  );
}