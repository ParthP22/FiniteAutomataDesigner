"use client";

import Link from "next/link";

export default function BackButton(){
    return (
        <Link 
            href="/" 
            className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
        >
            ← Back
        </Link>
    );
}