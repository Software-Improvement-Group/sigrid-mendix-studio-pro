import { getStudioProApi } from "@mendix/extensions-api";
import type { SigridSettings } from "./sigridStore";

const SETTINGS_FILE = "qsm-settings.json";

type StudioProApi = ReturnType<typeof getStudioProApi>;

export async function readSettingsFromFile(studioPro: StudioProApi): Promise<Omit<SigridSettings, "token"> | null> {
    try {
        const content = await studioPro.app.files.getFile(SETTINGS_FILE);
        const parsed = JSON.parse(content);
        if (parsed.customer && parsed.system) {
            const sigridUrl = typeof parsed.sigridUrl === "string" && parsed.sigridUrl.trim()
                ? parsed.sigridUrl.trim()
                : undefined;
            const settings = {
                customer: parsed.customer,
                system: parsed.system,
                sigridUrl,
            };
            if (typeof parsed.token === "string" && parsed.token.trim()) {
                await migrateLegacyToken(studioPro, parsed.token.trim(), settings);
            }
            return settings;
        }
        return null;
    } catch {
        return null;
    }
}

async function migrateLegacyToken(
    studioPro: StudioProApi,
    legacyToken: string,
    settings: Omit<SigridSettings, "token">,
): Promise<void> {
    try {
        if (!localStorage.getItem("sigridToken")) {
            localStorage.setItem("sigridToken", legacyToken);
        }
        await writeSettingsToFile(studioPro, settings);
    } catch {
    }
}

export async function writeSettingsToFile(studioPro: StudioProApi, settings: Omit<SigridSettings, "token">): Promise<void> {
    const content = JSON.stringify({
        customer: settings.customer,
        system: settings.system,
        sigridUrl: settings.sigridUrl ?? "",
    }, null, 2);
    await studioPro.app.files.putFile(SETTINGS_FILE, content);
}
