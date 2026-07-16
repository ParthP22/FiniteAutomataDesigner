'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

export default function DFSMPage() {
    return (
        <Suspense>
            <AutomataEditor type="DFSM" />
        </Suspense>
    );
}