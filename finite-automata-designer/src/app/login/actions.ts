'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  

  const { data, error } = await supabase.auth.signInWithPassword({email, password})

  if (error) {
    redirect('/error?msg=' + encodeURIComponent(error.message))
  }

  // 👇 Important: persist auth session
  await supabase.auth.setSession(data.session)
  console.log(data.user)

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({email, password})

  if (error) {
    redirect('/error')
  }

  if (data.session) {
    await supabase.auth.setSession(data.session)
    redirect('/')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}