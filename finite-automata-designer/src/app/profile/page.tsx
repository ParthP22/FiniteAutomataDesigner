"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
      } else {
        setUser(user);
      }

      setLoading(false);
    }

    loadUser();
  }, [router, supabase]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setErrorMessage("Error updating password: " + error.message);
    } else {
      setPasswordMessage("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSectionOpen(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-blue-100 py-8 flex justify-center">
      <div className="w-full max-w-3xl px-4 space-y-6">

        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Account Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="flex items-center space-x-4 mb-6">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile picture"
                className="w-20 h-20 rounded-full border-4 border-gray-200"
              />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                {user?.user_metadata?.name || "User"}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2
            className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center cursor-pointer select-none"
            onClick={() => setPasswordSectionOpen(!passwordSectionOpen)}
          >
            Change Password
            <span className={`transition-transform ${passwordSectionOpen ? "rotate-180" : ""}`}>▼</span>
          </h2>

          {passwordSectionOpen && (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 mt-2">

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Messages */}
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
                  {errorMessage}
                </div>
              )}
              {passwordMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center">
                  {passwordMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
