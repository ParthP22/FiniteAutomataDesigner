import { login, signup } from './actions'
import GoogleOAuthForm from '../components/forms/GoogleOAuth'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-blue-100 flex flex-col">
      {/* Page title (same style as homepage) */}
      <h1 className="relative text-4xl font-bold text-center mt-8 text-black">
        <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
          Login / Sign Up
        </span>
        <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
      </h1>

      {/* Centered form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md">
          <form className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                formAction={login}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Log in
              </button>
              <button
                formAction={signup}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Sign up
              </button>
            </div>
          </form>

          {/* Divider + Google button */}
          <div className="mt-6 flex flex-col items-center">
            <p className="text-gray-700 mb-3">Or continue with</p>
            <GoogleOAuthForm />
          </div>
        </div>
      </div>
    </main>
  )
}

