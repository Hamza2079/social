import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import * as z from "zod";

export default function Register() {
  const navigate = useNavigate();
  const schema = z
    .object({
      name: z
        .string()
        .min(2, "Name should be at least 2 characters")
        .nonempty("name is required"),
      email: z
        .string()
        .email("Invalid email address")
        .nonempty("Email is required"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
          "Password must contain: uppercase, lowercase, number, and special character (#?!@$%^&*-)",
        ),
      rePassword: z.string().nonempty("Please confirm your password"),
      dateOfBirth: z.string().nonempty("Date of Birth is required"),
      gender: z.enum(["female", "male"], "enter a valid gender"),
    })
    .refine((data) => data.password === data.rePassword, {
      message: "Passwords do not match",
      path: ["rePassword"],
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
      const { data, status } = await axios.post(
        "https://route-posts.routemisr.com/users/signup",
        values,
      );
      data;
      if (status == 201) {
        navigate("/");
      }
    } catch (e) {
      console.error("🟥 Error: ", e);
      setError("main", { message: e.response.data.error });
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center py-8"
      data-theme="dark"
    >
      <div
        className="w-full max-w-xl mx-auto px-6 py-8 rounded-3xl bg-base-200
                      border border-base-300 shadow-2xl
                      backdrop-blur-2xl"
      >
        <div className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary mb-2">
            Create account
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-base-content">
            Join <span className="text-primary">Linked/Post</span>
          </h1>
          <p className="text-xs opacity-60 mt-2">
            A modern social space with a clean, futuristic interface.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-200 mb-1 block">
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              className="input input-bordered input-primary w-full bg-base-100 text-base-content placeholder:opacity-40"
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-200 mb-1 block">
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
            <label className="text-xs font-medium text-slate-200 mb-1 block">
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
              Must be 8+ characters with uppercase, lowercase, number, and
              special character (#?!@$%^&*-)
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-200 mb-1 block">
              Confirm password
            </label>
            <input
              {...register("rePassword")}
              type="password"
              className="input input-bordered input-primary w-full bg-base-100 text-base-content placeholder:opacity-40"
              placeholder="••••••••"
            />
            {errors.rePassword && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.rePassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-200 mb-1 block">
              Date of birth
            </label>
            <input
              {...register("dateOfBirth")}
              type="date"
              className="input input-bordered input-primary w-full bg-slate-900/60 text-slate-50"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium opacity-70 mb-1">Gender</p>
            <div className="flex items-center gap-4 text-xs opacity-70">
              <label
                htmlFor="fe"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  {...register("gender")}
                  type="radio"
                  id="fe"
                  name="gender"
                  value="female"
                  className="radio radio-info"
                />
                <span>Female</span>
              </label>
              <label
                htmlFor="ma"
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  {...register("gender")}
                  type="radio"
                  id="ma"
                  name="gender"
                  value="male"
                  className="radio radio-info"
                />
                <span>Male</span>
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.gender.message}
              </p>
            )}
          </div>

          {errors.main && (
            <div className="md:col-span-2">
              <p className="text-sm text-center text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl py-2 px-3">
                {errors.main.message}
              </p>
            </div>
          )}

          <div className="md:col-span-2 mt-2">
            <button
              className="btn btn-primary w-full text-primary-content font-semibold tracking-wide
                         hover:shadow-lg
                         disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs opacity-60">
          Already have an account?{" "}
          <Link to="/" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
