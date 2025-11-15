import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
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
        const {data} = await axios.post('https://linked-posts.routemisr.com/users/signin',values)
      console.log(data);
      if (data.message=='success') {
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
    <div className='w-[60%] my-40 mx-auto my-8 p-5 shadow-lg rounded-2xl'>
      <h1 className='text-sky-800 text-3xl font-bold'>Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('email')} type="email" className="input my-4 w-full" placeholder="type ur email" />
        {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
        <input {...register('password')} type="password" className="input my-4 w-full" placeholder="type ur password" />
        {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
        <button className='text-white bg-sky-600 hover:bg-sky-900 p-2 my-3 rounded cursor-pointer'>{isSubmitting? "loading...":"SignIn"}</button>
        {errors.main && <p className='text-red-600 text-center'>{errors.main.message}</p>}
        <p className='text-center'>Don't have an account? <a href='/register' className='text-sky-600'>Register</a></p>
    </form>
    </div>
  )
}
