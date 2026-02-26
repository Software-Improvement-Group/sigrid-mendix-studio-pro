import { exec } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { appDir, studioProApp, studioProVersion } from "../config.mjs";

if (!appDir) {
    console.error("Error: appDir is not configured in config.mjs");
    process.exit(1);
}

try {
    const files = readdirSync(appDir);
    const mprFile = files.find(f => f.endsWith(".mpr"));

    if (!mprFile) {
        console.error(`Error: No .mpr file found in ${appDir}`);
        process.exit(1);
    }

    const fullPath = join(appDir, mprFile);
    const isWindows = process.platform === "win32";
    
    const version = studioProVersion || "11.7.0";

    const command = isWindows
        ? `start "" "C:\\Program Files\\Mendix\\${version}\\modeler\\studiopro.exe" --enable-extension-development "${fullPath}"`
        : `open -a "${studioProApp || "Studio Pro " + version}" "${fullPath}" --args --enable-extension-development`;

    console.log(`Launching ${isWindows ? "Studio Pro " + version : (studioProApp || "Studio Pro")} with: ${mprFile}`);
    
    exec(command, (error) => {
        if (error) {
            console.error(`Execution error: ${error.message}`);
            process.exit(1);
        }
    });
} catch (e) {
    console.error(`Error: Could not read directory ${appDir}. Check your config.mjs.`);
    process.exit(1);
}
