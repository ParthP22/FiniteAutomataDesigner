'use client'
import { signinWithGoogle } from '@/lib/actions'
import React from 'react'

const GoogleOAuthForm = () => {
    return (
        <div>
            <form>
                <button className="btn" formAction={signinWithGoogle}>
                    Sign in with Google
                </button>
            </form>
        </div>
    )
}

export default GoogleOAuthForm