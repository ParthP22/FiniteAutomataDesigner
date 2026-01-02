'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { updatePassword } from '@/lib/actions';

const UpdatePasswordPage = () => {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(updatePassword, {
    error: '',
    success: '',
  });

  const { error, success } = state;

  // 🔑 Redirect after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1500); // 1.5 seconds so user sees the success message

      return () => clearTimeout(timer);
    }
  }, [success, router]);

  return (
    <main className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Set New Password
        </h1>

        <form action={formAction} className="flex flex-col gap-4">
          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Updating…' : 'Update Password'}
          </button>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Success */}
          {success && (
            <p className="text-sm text-green-600 text-center">{success}</p>
          )}
        </form>
      </div>
    </main>
  );
};

export default UpdatePasswordPage;
