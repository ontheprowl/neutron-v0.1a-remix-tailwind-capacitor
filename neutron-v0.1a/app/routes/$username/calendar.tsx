import { Outlet } from "@remix-run/react"

import { ModuleLoader } from "~/utils/moduleLoader";

// @ts-ignore
import { getGantt, getGanttSelection, getGanttTimelinePointer, getGanttItemResizing, getGanttItemMovement } from '~/utils/esm-module';




export default function CalendarPage() {
    return (
        <Outlet></Outlet>)
}