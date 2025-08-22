// "use client";

// import { useSession, signIn } from "next-auth/react";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { AuthError, Session, User } from "@supabase/supabase-js";

// export default function LoginPage() {
//   const { data: session, status } = useSession();
//   const [userName, setUserName] = useState("");
//   const [password, setPassword] = useState("");

//   const [error, setError] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const router = useRouter();

//   // const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   if(userName === "" || password === ""){
//   //     setError(true);
//   //   }
//   //   else{
//   //     try{
//   //       const res = await fetch("api/login-user", {
//   //         method: "POST",
//   //         headers: { "Content-Type": "application/json" },
//   //         body: JSON.stringify({ userID: userName, password}),
//   //       });

//   //       if (!res.ok) throw new Error("Network response was not ok");

//   //       const data = await res.json();
//   //       console.log("User saved:", data);
//   //       setSubmitted(true);

//   //     }
//   //     catch(err){
//   //       setError(true);
//   //       console.error("Failed to log in user: ", err);
//   //     }
      
//   //   }
//   // };

//   const handleGoogleLogin = async () =>{
//     const {error} = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//     });

//     if(error){
//       console.error("Error logging in with Google: ", error.message);
//     } 
//   };

//   useEffect(() => {
//     if (status === "authenticated") {
//       router.replace("/"); // or your main page
//     }
//   }, [status, router]);

//   return (
//     <main className="min-h-screen bg-blue-100 flex flex-col">
//       {/* Title */}
//       <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
//         <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
//           Login
//         </span>
//         <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
//       </h1>

//       {/* Form Card */}
//       <div className="flex justify-center mt-12">
//         <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md space-y-6">
//           <form
//             // onSubmit={handleSubmit}
//           >  
//             <div>
//               <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="username">
//                 Username
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 value={userName}
//                 onChange={(e) => setUserName(e.target.value)}
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="JaneDoe123"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="password">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="••••••••"
//               />
//             </div>

//             <button
//               className="w-full py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
//               onClick={() => {
//                 // You can implement username/password auth logic here
//                 console.log("Logging in with:", { userName, password });
//               }}
//             >
//               Sign in
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* OR Divider */}
//       <div className="my-6 text-center text-gray-500 font-medium">OR</div>

//       {/* Google sign-in button */}
//       <div className="flex justify-center mb-10">
//         <button
//           onClick={() => signIn("google")}
//           className="flex items-center space-x-3 px-10 py-5 bg-gray-600 text-2xl text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-transform duration-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
//         >
//           <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <g clipPath="url(#clip0_17_40)">
//               <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.5 34.7 31.7 36.4V42H39.3C44 38 47.5 31.9 47.5 24.5Z" fill="#4285F4"/>
//               <path d="M24 48C30.6 48 36.1 45.9 39.3 42L31.7 36.4C29.9 37.6 27.7 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.5V34.5C5.7 41.1 14.1 48 24 48Z" fill="#34A853"/>
//               <path d="M10.3 28.7C9.8 27.5 9.5 26.2 9.5 24.8C9.5 23.4 9.8 22.1 10.3 20.9V15.1H2.5C0.8 18.2 0 21.5 0 24.8C0 28.1 0.8 31.4 2.5 34.5L10.3 28.7Z" fill="#FBBC05"/>
//               <path d="M24 9.7C27.7 9.7 30.6 11 32.6 12.8L39.5 6C36.1 2.8 30.6 0.5 24 0.5C14.1 0.5 5.7 7.4 2.5 14L10.3 19.8C12.2 14.3 17.7 9.7 24 9.7Z" fill="#EA4335"/>
//             </g>
//             <defs>
//               <clipPath id="clip0_17_40">
//                 <rect width="48" height="48" fill="white" />
//               </clipPath>
//             </defs>
//           </svg>
//           <span>Sign in with Google</span>
//         </button>
//       </div>
//       <script src="https://accounts.google.com/gsi/client" async></script>
//     </main>
    
//   );

// }

import { login, signup } from './actions'
export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}
