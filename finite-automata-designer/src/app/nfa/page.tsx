'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

export default function NFAPage() {
    return (
        <Suspense>
            <AutomataEditor type="NFA" />
        </Suspense>
    );
}