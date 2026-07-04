'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

export default function DFAPage() {
    return (
        <Suspense>
            <AutomataEditor type="DFA" />
        </Suspense>
    );
}