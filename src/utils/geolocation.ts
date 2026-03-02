import joplin from "api";

export interface GeoLocation {
    latitude: number;
    longitude: number;
    altitude?: number;
}

/**
 * Checks whether the user has enabled "Save geo-location with notes" in Joplin settings.
 */
export const isGeoLocationEnabled = async (): Promise<boolean> => {
    try {
        const value = await joplin.settings.globalValue("note.saveGeolocation");
        return value === true;
    } catch {
        // If the setting key is unavailable, default to false
        return false;
    }
};

/**
 * Gets the current GPS coordinates using the browser's geolocation API.
 * Joplin runs on Electron, so navigator.geolocation is available.
 * Returns null if geolocation is unavailable or the user denies permission.
 */
export const getCurrentLocation = (): Promise<GeoLocation | null> => {
    return new Promise((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    altitude: position.coords.altitude ?? undefined,
                });
            },
            () => {
                // User denied or error — resolve with null gracefully
                resolve(null);
            },
            {
                timeout: 5000,
                maximumAge: 60000,
            }
        );
    });
};

/**
 * Returns geo-location data to attach to a note, respecting the Joplin setting.
 * Returns null if the setting is disabled or location cannot be determined.
 */
export const getGeoLocationForNote = async (): Promise<GeoLocation | null> => {
    const enabled = await isGeoLocationEnabled();
    if (!enabled) return null;
    return await getCurrentLocation();
};
