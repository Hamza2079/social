import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom';
import * as z from "zod";
import { tokencontext } from '../../context/tokenContext.jsx';

export default function Register() {
  const navigate= useNavigate()
  const {setToken} = useContext(tokencontext)
  const schema = z.object({
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z.string().min(6, "Password should be at least 6 characters").nonempty("Password is required"),
  })

  const {register,handleSubmit,formState:{errors,isSubmitting},setError}=useForm({
    resolver:zodResolver(schema)
  })

  async function onSubmit(values){
    console.log(values);
    try {
      const {data,status} = await axios.post('https://linked-posts.routemisr.com/users/signin',values)
      console.log({data,status});
      if (status==200) {
        console.log(data);
        setToken(data.token)
        localStorage.setItem('token',data.token)
        navigate('/home')
      }
    } catch (e) {
      console.error("🟥 Error: ", e)
      setError('main',{message:e.response.data.error})
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6 py-8 rounded-3xl bg-slate-900/70
                      border border-sky-500/40 shadow-[0_25px_80px_rgba(8,47,73,0.95)]
                      backdrop-blur-2xl">
        <div className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80 mb-2">
            Welcome back
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
            Sign in to <span className="text-sky-300">Linked/Post</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Continue where you left off. Your feed is waiting.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-200 mb-1 block">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="input input-bordered input-primary w-full bg-slate-900/60 text-slate-50 placeholder:text-slate-500"
              placeholder="name@domain.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-200 mb-1 block">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="input input-bordered input-primary w-full bg-slate-900/60 text-slate-50 placeholder:text-slate-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
          </div>

          {errors.main && (
            <p className="text-sm text-center text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl py-2 px-3">
              {errors.main.message}
            </p>
          )}

          <button
            className="btn btn-primary w-full mt-2 bg-sky-500
                       border-none text-slate-950 font-semibold tracking-wide
                       hover:bg-sky-400 hover:shadow-[0_12px_30px_rgba(15,23,42,0.9)]
                       disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-sky-300 hover:text-sky-200 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
