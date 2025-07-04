"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full bg-gray-800 text-white px-8 py-4 flex items-center justify-between shadow">
      <div className="text-2xl font-bold tracking-wide">
        <a href="/">Finite Automata Designer</a>
      </div>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="User avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            )}
            <span className="hidden sm:inline">{session.user?.name}</span>
            <Link
              href="/profile"
              className="px-5 py-2 bg-blue-500 hover:bg-blue-700 rounded transition"
            >
              Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="px-5 py-2 bg-red-500 hover:bg-red-700 rounded transition"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-700 rounded transition"
          >
            Log in
          </button>
        )}
      </div>
    </nav>
  );
}

