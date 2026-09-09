"use client";

import Link from "next/link";

export default function ProjectsButton(){
    return (
        <Link
            href="/projects"
            className="inline-flex items-center justify-center bg-gray-700 text-white px-6 py-3 rounded hover:bg-black transition"
        >
            My Projects
        </Link>
    );
}