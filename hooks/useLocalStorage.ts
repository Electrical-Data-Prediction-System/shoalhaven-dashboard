import { useMemo, useRef, useSyncExternalStore } from "react";

const DATABASE_ID =
    process.env.NEXT_PUBLIC_DATABASE_ID ?? "demo";

const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    window.addEventListener("storage", callback);
    window.addEventListener("local-storage-update", callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("local-storage-update", callback);
    };
};

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    // Automatically namespace keys by database
    const storageKey = `${DATABASE_ID}-${key}`;

    const lastStringRef = useRef<string | null>(null);
    const initialString = JSON.stringify(initialValue);

    const getSnapshot = () => {
        if (typeof window === "undefined") return initialString;

        try {
            const item = window.localStorage.getItem(storageKey);
            const nextString = item ?? initialString;

            if (lastStringRef.current !== nextString) {
                lastStringRef.current = nextString;
            }

            return lastStringRef.current;
        } catch {
            return initialString;
        }
    };

    const getServerSnapshot = () => initialString;

    const storeString = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const value = useMemo(() => {
        try {
            return JSON.parse(storeString) as T;
        } catch {
            console.warn(`Invalid storage data for key: ${storageKey}`);
            return initialValue;
        }
    }, [storeString, initialValue, storageKey]);

    const setValue = (newValue: T) => {
        if (typeof window === "undefined") return;

        try {
            window.localStorage.setItem(
                storageKey,
                JSON.stringify(newValue)
            );
            window.dispatchEvent(new Event("local-storage-update"));
        } catch (error) {
            console.error(
                `Could not save updates for key: ${storageKey}`,
                error
            );
        }
    };

    return [value, setValue];
}