"use client";

import Link from "next/link";

interface ProjectCardProps{
    id: string;
    name: string;
    description: string | null;
    type: string;
}

export async function ProjectCard({id, name, description, type}: ProjectCardProps){
    return (
        <Link
            href={`/dfa?id=${id}`}
        >
            <div>
                <h2>
                    {name}
                </h2>
                <span>
                    {type}
                </span>
            </div>

            <p>
                {description || "No description provided."}
            </p>

            <div>
                <p>
                    ID: {id}
                </p>
            </div>
        </Link>
    );
}