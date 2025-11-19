
export type ActionType =
  | 'APP_INIT'
  | 'MOVE'
  | 'UNDO'
  | 'RESET'
  | 'CHANGE_VIEW_MODE'
  | 'CHANGE_MAIN_VIEW'
  | 'TOGGLE_TARGET_VIEW'
  | 'CHAT_MSG_SENT'
  | 'CHAT_MSG_RECEIVED'
  | 'CHAT_ERROR'
  | 'PUZZLE_SOLVED'
  | 'WALKTHROUGH_STARTED'
  | 'WALKTHROUGH_COMPLETED';

export interface DiagnosticEvent {
  timestamp: number;
  type: ActionType;
  data?: any;
}

class DiagnosticsService {
  private events: DiagnosticEvent[] = [];

  constructor() {
    this.log('APP_INIT', { userAgent: navigator.userAgent });
    
    // Expose helper to download logs from console
    if (typeof window !== 'undefined') {
        (window as any).downloadSessionLogs = () => this.download();
        (window as any).getSessionLogs = () => this.events;
    }
  }

  log(type: ActionType, data?: any) {
    const event: DiagnosticEvent = {
      timestamp: Date.now(),
      type,
      data
    };
    this.events.push(event);
    // Uncomment for debugging if needed
    // console.log(`[Diagnostics] ${type}`, data || '');
  }

  download() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `knight_swap_session_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

export const diagnostics = new DiagnosticsService();
