'use client';

import { useActionState } from 'react';
import { sendResetPasswordEmail } from '@/lib/actions';

export default function ResetPage() {
  const [state, formAction, isPending] = useActionState(
    sendResetPasswordEmail,
    {
      error: '',
      success: '',
    }
  );

  const { error, success } = state;

  return (
    <main className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Reset Password
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Sending…' : 'Send reset link'}
          </button>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {/* Success message */}
          {success && (
            <p className="text-sm text-green-600 text-center">
              {success}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
