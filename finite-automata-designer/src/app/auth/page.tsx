import GoogleOAuthForm from '@/app/components/forms/GoogleOAuth'
import React from 'react'

const Page = () => {
    return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <h1 className='text-4xl font-bold'>Not Authenticated</h1>
            <GoogleOAuthForm />
        </div>
    )
}

export default Page