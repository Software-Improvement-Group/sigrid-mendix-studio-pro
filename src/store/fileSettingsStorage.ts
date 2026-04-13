import { getStudioProApi } from "@mendix/extensions-api";
import type { SigridSettings } from "./sigridStore";

const SETTINGS_FILE = "qsm-settings.json";

type StudioProApi = ReturnType<typeof getStudioProApi>;

export async function readSettingsFromFile(studioPro: StudioProApi): Promise<SigridSettings | null> {
    try {
        const content = await studioPro.app.files.getFile(SETTINGS_FILE);
        const parsed = JSON.parse(content);
        if (parsed.token && parsed.customer && parsed.system) {
            const sigridUrl = typeof parsed.sigridUrl === "string" && parsed.sigridUrl.trim()
                ? parsed.sigridUrl.trim()
                : undefined;
            return {
                token: parsed.token,
                customer: parsed.customer,
                system: parsed.system,
                sigridUrl,
            };
        }
        return null;
    } catch {
        return null;
    }
}

export async function writeSettingsToFile(studioPro: StudioProApi, settings: SigridSettings): Promise<void> {
    const content = JSON.stringify({
        token: settings.token,
        customer: settings.customer,
        system: settings.system,
        sigridUrl: settings.sigridUrl ?? "",
    }, null, 2);
    await studioPro.app.files.putFile(SETTINGS_FILE, content);
}
