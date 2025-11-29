'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/error?msg=' + encodeURIComponent(error.message))
  }

  // Important: persist auth session
  await supabase.auth.setSession(data.session)

  // Note: Do NOT router.refresh() here - this is server-side
  revalidatePath('/')
}


export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({ email, password })

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
