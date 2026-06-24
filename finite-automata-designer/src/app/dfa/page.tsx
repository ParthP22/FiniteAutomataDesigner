'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

function DFAPageContent() {

    return (
        <AutomataEditor type="DFA" />
    );
}

export default function DFAPage() {
    return (
        <Suspense>
            <DFAPageContent />
        </Suspense>
    );
}