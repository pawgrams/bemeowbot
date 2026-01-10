const ended: string[]  = ["cancelled", "failed", "completed", "incomplete", "expired"];
const active: string[] = ["queued", "in_progress", "requires_action", "cancelling"];
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
export const isRunActive = (status: string): boolean => active.includes(status);