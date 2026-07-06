"use client";

import Link from "next/link";

export default function ProjectsButton(){
    return (
        <Link
            href="/projects"
            className="flex-none px-8 py-3 bg-gray-700 text-white rounded hover:bg-black transition"
        >
            My Projects
        </Link>
    );
}