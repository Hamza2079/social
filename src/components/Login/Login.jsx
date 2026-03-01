import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import * as z from "zod";
import { tokencontext } from "../../context/tokenContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { setToken } = useContext(tokencontext);
  const schema = z.object({
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
    password: z.string().nonempty("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values) {
    values;
    try {
      const { data } = await axios.post(
        "https://route-posts.routemisr.com/users/signin",
        values,
      );
      if (data.success === true) {
        setToken(data.data.token);
        localStorage.setItem("token", data.data.token);
        navigate("/home");
      }
    } catch (e) {
      console.error("🟥 Error: ", e);
      setError("main", { message: e.response.data.error });
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center"
      data-theme="dark"
    >
      <div
        className="w-full max-w-md mx-auto px-6 py-8 rounded-3xl bg-base-200
                      border border-base-300 shadow-2xl
                      backdrop-blur-2xl"
      >
        <div className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary mb-2">
            Welcome back
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-base-content">
            Sign in to <span className="text-primary">Linked/Post</span>
          </h1>
          <p className="text-xs opacity-60 mt-2">
            Continue where you left off. Your feed is waiting.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="input input-bordered input-primary w-full bg-base-100 text-base-content placeholder:opacity-40"
              placeholder="name@domain.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="input input-bordered input-primary w-full bg-base-100 text-base-content placeholder:opacity-40"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs opacity-50">
              Password must be 8+ characters with uppercase, lowercase, number,
              and special character (#?!@$%^&*-)
            </p>
          </div>

          {errors.main && (
            <p className="text-sm text-center text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl py-2 px-3">
              {errors.main.message}
            </p>
          )}

          <button
            className="btn btn-primary w-full mt-2 text-primary-content font-semibold tracking-wide
                       hover:shadow-lg
                       disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs opacity-60">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
