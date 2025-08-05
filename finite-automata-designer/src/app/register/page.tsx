"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/lib/dynamodb";

export default function Form() {
  // States for registration
  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States for checking the errors
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Trying to fix the hydration error
  // const [isClient, setIsClient] = useState(false)
 
  // useEffect(() => {
  //   setIsClient(true)
  // }, [])

  const handleUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setSubmitted(false);
  };

  // Handling the name change
  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setSubmitted(false);
  };

  // Handling the email change
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setSubmitted(false);
  };

  // Handling the password change
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setSubmitted(false);
  };

  // Handling the form submission
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name === "" || email === "" || password === "") {
      setError(true);
    } else {
      setSubmitted(true);
      setError(false);
      try {
        const res = await fetch("/api/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: userName, name, email, password }),
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        console.log("User saved:", data);
        setSubmitted(true);
        setError(false);
      } catch (err) {
        console.error("Failed to save user:", err);
      }
    }
  };

  // Showing success message
  const successMessage = () => {
    return (
      <div
        className="success"
        style={{
          display: submitted ? "" : "none",
        }}
      >
        <h1>User {userName} successfully registered!!</h1>
      </div>
    );
  };

  // Showing error message if error is true
  const errorMessage = () => {
    return (
      <div
        className="error"
        style={{
            display: error ? "" : "none",
        }}
      >
        <h1>Please enter all the fields</h1>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-blue-100 flex flex-col">
      
      {/* Page title */}
      <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
        <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
          User Registration
        </span>
        <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
      </h1>
        {/* Form container */}
        <div className="flex-grow flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
          >
            {/* Messages */}
            <div className="space-y-2">
              {errorMessage()}
              {successMessage()}
            </div>

            {/* Name field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={handleName}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Jane Doe"
              />
            </div>

            {/* Username field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Username</label>
              <input
                type="text"
                value={userName}
                onChange={handleUserName}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="janedoe123"
              />
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmail}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="jane@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePassword}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 px-6 py-4 bg-gray-600 text-2xl text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Submit
            </button>
          </form>
          
      </div>
    </main>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// interface RegistrationErrors {
//   name?: string;
//   username?: string;
//   email?: string;
//   password?: string;
//   general?: string;
// }

// export default function RegisterPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: "",
//     username: "",
//     email: "",
//     password: "",
//   });
//   const [errors, setErrors] = useState<RegistrationErrors>({});
//   const [loading, setLoading] = useState(false);
//   const [successMsg, setSuccessMsg] = useState("");

//   const validate = () => {
//     const e: RegistrationErrors = {};
//     if (!form.name.trim()) e.name = "Name is required";
//     if (!form.username.trim()) e.username = "Username is required";
//     if (!form.email.trim()) e.email = "Email is required";
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
//     if (!form.password) e.password = "Password is required";
//     else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
//     return e;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});
//     const v = validate();
//     if (Object.keys(v).length > 0) {
//       setErrors(v);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch("/api/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         setErrors({ general: data?.message || "Registration failed" });
//       } else {
//         setSuccessMsg("Registration successful! Redirecting to login...");
//         setTimeout(() => {
//           router.push("/login");
//         }, 1500);
//       }
//     } catch (err) {
//       setErrors({ general: "Network error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-blue-100 flex flex-col">
//       <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
//         <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">Register</span>
//         <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
//       </h1>

//       <div className="flex-grow flex items-center justify-center px-4">
//         <form
//           onSubmit={handleSubmit}
//           className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
//         >
//           {errors.general && (
//             <div className="text-red-600 bg-red-100 px-4 py-2 rounded">{errors.general}</div>
//           )}
//           {successMsg && (
//             <div className="text-green-700 bg-green-100 px-4 py-2 rounded">{successMsg}</div>
//           )}

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="name">
//               Full Name
//             </label>
//             <input
//               id="name"
//               type="text"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
//                 errors.name ? "border-red-500" : "border-gray-300"
//               }`}
//               placeholder="Jane Doe"
//             />
//             {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="username">
//               Username
//             </label>
//             <input
//               id="username"
//               type="text"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
//                 errors.username ? "border-red-500" : "border-gray-300"
//               }`}
//               placeholder="janedoe123"
//             />
//             {errors.username && (
//               <p className="text-red-500 text-sm mt-1">{errors.username}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               }`}
//               placeholder="jane@example.com"
//             />
//             {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1" htmlFor="password">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
//                 errors.password ? "border-red-500" : "border-gray-300"
//               }`}
//               placeholder="At least 8 characters"
//             />
//             {errors.password && (
//               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center items-center space-x-2 px-6 py-4 bg-gray-600 text-2xl text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
//           >
//             {loading ? "Registering..." : "Create Account"}
//           </button>

//           <p className="text-center text-sm">
//             Already have an account?{" "}
//             <a
//               href="/login"
//               className="font-semibold underline hover:text-blue-800"
//             >
//               Sign in
//             </a>
//           </p>
//         </form>
//       </div>
//     </main>
//   );
// }