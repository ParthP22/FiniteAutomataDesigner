"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full bg-gray-700 text-white px-8 py-4 flex items-center justify-between shadow">
      <div className="text-2xl font-bold tracking-wide">
        <a href="/">Finite Automata Designer</a>
      </div>
      <div className="flex items-center space-x-4">

        {/* Note: you cannot use normal if-statements inside the return method lol, so use conditional operator */}
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
        // Here is the equivalent of the "else if" part of the conditional operator
        // Previous issue: whenever you go from the profile page back to the home page, 
        // it would temporarily return the "log out" button to a "log in" button and your
        // name and profile button would disappear. It gave the impression that you were logged out.
        // Fix: Now, we show a loading spinner in the top right corner of the navbar when performing
        // this action.This is a workaround to prevent the aforementioned issue from happening.
        ) : status === "loading" ? (
          <div className="w-24 h-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        // Here is the "else" part of the conditional operator
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

