"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed."
        );
      }

      localStorage.setItem(
        "nexa_access_token",
        data.access_token
      );

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">

        <div className="w-full">

          {/* Logo */}
          <Link
            href="/"
            className="mx-auto flex w-fit items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] font-semibold">
              N
            </div>

            <span className="text-xl font-semibold">
              NEXA <span className="text-white/40">AI</span>
            </span>
          </Link>

          {/* Card */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-7 sm:p-9">

            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/40">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Career Intelligence
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-3 text-sm text-white/35">
                Sign in to continue to NEXA AI.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>

            {/* Register */}
            <p className="mt-7 text-center text-sm text-white/35">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-white/70 transition hover:text-white"
              >
                Create one
              </Link>
            </p>

          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-xs text-white/20">
            NEXA AI · Intelligent Career Intelligence
          </p>

        </div>
      </div>
    </main>
  );
}