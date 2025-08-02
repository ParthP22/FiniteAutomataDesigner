"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/"); // or your main page
    }
  }, [status, router]);

  return (
    <main className="min-h-screen bg-blue-100 flex flex-col">
      
      {/* Title at the top */}
      <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
        <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
          Login
        </span>
        <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
      </h1>

      {/* Just used for debugging to see if user is authenticated */}
      {/* <pre>{JSON.stringify({ session, status }, null, 2)}</pre> */}

      <div>
        
      </div>

      {/* Centered Google sign-in button */}
      <div className="flex-grow flex items-center justify-center">
        {/* Sign in button */}
        <button
          onClick={() => signIn('google')}
          className="flex items-center space-x-3 px-10 py-5 bg-gray-600 text-2xl text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {/* Google logo SVG */}
          <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.5 34.7 31.7 36.4V42H39.3C44 38 47.5 31.9 47.5 24.5Z" fill="#4285F4"/>
              <path d="M24 48C30.6 48 36.1 45.9 39.3 42L31.7 36.4C29.9 37.6 27.7 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.5V34.5C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
              <path d="M10.3 28.7C9.8 27.5 9.5 26.2 9.5 24.8C9.5 23.4 9.8 22.1 10.3 20.9V15.1H2.5C0.8 18.2 0 21.5 0 24.8C0 28.1 0.8 31.4 2.5 34.5L10.3 28.7Z" fill="#FBBC05"/>
              <path d="M24 9.7C27.7 9.7 30.6 11 32.6 12.8L39.5 6C36.1 2.8 30.6 0.5 24 0.5C14.1 0.5 5.7 7.4 2.5 14L10.3 19.8C12.2 14.3 17.7 9.7 24 9.7Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </main>
  );
}
