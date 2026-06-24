'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

function NFAPageContent() {

    return (
        <AutomataEditor type="NFA" />
    );
}

export default function NFAPage() {
    return (
        <Suspense>
            <NFAPageContent />
        </Suspense>
    );
}