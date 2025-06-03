import Image from "next/image";
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-100 flex flex-col">
      {/* Title at the top */}
      <h1 className="relative text-5xl font-bold text-center mt-8 text-black">
  <span className="relative z-10 drop-shadow-[0_0_1px_rgba(0,0,0,0.7)]">
    Finite Automata Designer
  </span>
  <span className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-20 rounded pointer-events-none"></span>
</h1>

      {/* Buttons centered in the page */}
      <div className="flex-grow flex items-center justify-center">
        <div className="flex space-x-4">
          <Link href="/dfa" passHref>
            <button className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-colors duration-400">
              DFA
            </button>
          </Link>
          <button className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-black hover:shadow-lg hover:scale-105 transition-colors duration-400">
            NFA
          </button>
        </div>
      </div>
    </main>
  );
}
