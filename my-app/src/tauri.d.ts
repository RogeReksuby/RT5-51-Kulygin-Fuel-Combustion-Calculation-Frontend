// src/tauri.d.ts
interface Window {
  __TAURI__?: {
    invoke: (command: string, payload?: any) => Promise<any>;
    event: {
      listen: (event: string, handler: (event: any) => void) => Promise<void>;
      emit: (event: string, payload?: any) => Promise<void>;
    };
    app: {
      getVersion: () => Promise<string>;
    };
    window: {
      appWindow: {
        close: () => Promise<void>;
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
      };
    };
  };
}