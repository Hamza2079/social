import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import * as z from "zod";

export default function Register() {
  const navigate= useNavigate()
  const schema = z.object({
    name: z.string().min(2, "Name should be at least 2 characters").nonempty("name is required"),
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z.string().min(6, "Password should be at least 6 characters").nonempty("Password is required"),
    rePassword: z.string().nonempty("Password is required"),
    dateOfBirth: z.string().nonempty("Date of Birth is required"),
    gender: z.enum(['female','male'],'enter a valid gender')
  }).refine((data) => data.password === data.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"]
  })

  const {register,handleSubmit,formState:{errors,isSubmitting},setError}=useForm({
    resolver:zodResolver(schema)
  })
  async function onSubmit(values){
    console.log(values);
    try {
        const {data} = await axios.post('https://linked-posts.routemisr.com/users/signup',values)
      console.log(data);
      if (data.message=='success') {
        navigate('/login')
      }
    } catch (e) {
      console.error("🟥 Error: ", e)
      setError('main',{message:e.response.data.error})
    }
    
  }

  return (
    <div className='w-[60%] mx-auto my-8 p-5 shadow-lg rounded-2xl'>
      <h1 className='text-sky-800 text-3xl font-bold'>Register Now!!</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} type="text" className="input my-4 w-full" placeholder="Type ur name" />
        {errors.name && <p className='text-red-600'>{errors.name.message}</p>}
        <input {...register('email')} type="email" className="input my-4 w-full" placeholder="type ur email" />
        {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
        <input {...register('password')} type="password" className="input my-4 w-full" placeholder="type ur password" />
        {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
        <input {...register('rePassword')}type="password" className="input my-4 w-full" placeholder="confirm ur password" />
        {errors.rePassword && <p className='text-red-600'>{errors.rePassword.message}</p>}
        <input {...register('dateOfBirth')} type="date" className="input my-4 w-full" placeholder="select date" />
        {errors.dateOfBirth && <p className='text-red-600'>{errors.dateOfBirth.message}</p>}
        <div className='my-2'>
          <label htmlFor="fe">female</label>
          <input {...register('gender')} type="radio" id='fe' name="gender" value='female' className="radio radio-primary mx-4" />
          <label htmlFor="ma">male</label>
          <input {...register('gender')} type="radio" id='ma' name="gender" value='male' className="radio radio-primary mx-4" />
        </div>
        {errors.gender && <p className='text-red-600'>{errors.gender.message}</p>}
        <button className='text-white bg-sky-600 hover:bg-sky-900 p-2 my-3 rounded cursor-pointer'>{isSubmitting? "loading...":"SignUp"}</button>
        {errors.main && <p className='text-red-600 text-center'>{errors.main.message}</p>}
    </form>
    <p className='text-center'>Already have an account? <a href='/' className='text-sky-600'>Login</a></p>
    </div>
  )
}
