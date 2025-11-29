"use client";

import { useRouter } from "next/navigation";
import { login, signup } from "../../login/actions"; // server actions
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <form
      className="flex flex-col gap-4"

      // Prevent default and run server action manually to ensure session cookies are synced
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-action");

        if (action === "login") {
          await login(formData);
        }
        else {
          await signup(formData);
        }

        // Use window.location for a full page reload to ensure session cookies are synced
        // This is more reliable than router navigation for auth state updates
        // The Navbar will properly detect the logged-in state after the reload
        window.location.href = "/";
      }}
    >
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          type="submit"
          data-action="login"
          className="flex-1 px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Log in
        </button>
        <button
          type="submit"
          data-action="signup"
          className="flex-1 px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
