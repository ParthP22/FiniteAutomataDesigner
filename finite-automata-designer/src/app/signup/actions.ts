'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({ email, password })
  
  //console.log("Error object: " + error)
  
  if (error) {
    // Check if the error is due to an existing account
    // const errorMessage = error.message.toLowerCase()
    // console.log("Error message: " + errorMessage)
    // if (
    //   errorMessage.includes('already registered') ||
    //   errorMessage.includes('user already registered') ||
    //   errorMessage.includes('email already registered') ||
    //   error.code === 'signup_disabled' ||
    //   errorMessage.includes('already exists')
    // ) {
    //   return { error: 'An account with this email already exists. Please log in instead.' }
    // }


    // Return other errors as-is
    return { error: error.message }
  }

  if (data.session) {
    // User is immediately signed in (email confirmation disabled)
    await supabase.auth.setSession(data.session)
    revalidatePath('/', 'layout')
    return { success: true }
  }

  // If no session, email confirmation is required
  revalidatePath('/', 'layout')
  return { success: true, message: 'Please check your email to verify your account. A confirmation link has been sent to your email address.' }
}
