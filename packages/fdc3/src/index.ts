import fdc3Factory from "./main";
import { WindowType } from "./types/windowtype";

let globalFdc3 = (window as WindowType).fdc3;

if (typeof globalFdc3 === "undefined") {
    globalFdc3 = fdc3Factory();
    // if we are running Electron with contextIsolated
    const hasGlue42electron = window && (window as any).glue42electron;
    if (hasGlue42electron) {
        const runningInElectron = process && (process as any).contextIsolated;
        if(runningInElectron){
            const contextBridge = require("electron").contextBridge;
            contextBridge.exposeInMainWorld("fdc3", globalFdc3);
        }
    }
    (window as WindowType).fdc3 = globalFdc3;
} else {
    console.warn("Defaulting to using the auto-injected fdc3.");
}

export default globalFdc3;
