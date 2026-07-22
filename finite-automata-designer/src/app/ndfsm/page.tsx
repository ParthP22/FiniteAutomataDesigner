'use client';

import { Suspense } from "react";
import AutomataEditor from "../components/editor/AutomataEditor";

export default function NDFSMPage() {
    return (
        <Suspense>
            <AutomataEditor type="NDFSM" />
        </Suspense>
    );
}