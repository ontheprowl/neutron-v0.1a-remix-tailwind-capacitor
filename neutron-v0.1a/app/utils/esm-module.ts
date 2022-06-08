// @ts-ignore
module.exports = {
    // @ts-ignore
    getGantt: async () => await import("gantt-schedule-timeline-calendar/dist/gstc.wasm.esm.min.js"),
    getGanttTimelinePointer: async () => await import("gantt-schedule-timeline-calendar/dist/plugins/timeline-pointer.esm.min.js"),
    getGanttSelection: async () => await import("gantt-schedule-timeline-calendar/dist/plugins/selection.esm.min.js"),
    getGanttItemResizing : async () => await import("gantt-schedule-timeline-calendar/dist/plugins/item-resizing.esm.min.js"),
    getGanttItemMovement : async () => await import("gantt-schedule-timeline-calendar/dist/plugins/item-movement.esm.min.js")
};