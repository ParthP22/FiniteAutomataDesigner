'use client'
import { signinWithGoogle } from '@/lib/actions'
import React from 'react'

const GoogleOAuthForm = () => {
  return (
    <form className="flex justify-center">
      <button
        type="submit"
        formAction={signinWithGoogle}
        className="px-8 py-3 bg-gray-600 text-white text-lg rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Sign in with Google
      </button>
    </form>
  )
}

export default GoogleOAuthForm
