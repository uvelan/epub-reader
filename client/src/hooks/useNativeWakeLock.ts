import { useEffect, useRef } from 'react';

// Manually define missing Wake Lock types
type WakeLockSentinel = {
    released: boolean;
    release: () => Promise<void>;
    addEventListener: (type: 'release', listener: () => void) => void;
    removeEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockType = 'screen';

interface WakeLock {
    request: (type: WakeLockType) => Promise<WakeLockSentinel>;
}

interface NavigatorWithWakeLock extends Navigator {
    wakeLock?: WakeLock;
}

export function useNativeWakeLock(enabled: boolean) {
    const lockRef = useRef<WakeLockSentinel | null>(null);
    const releaseHandler = useRef<() => void>(() => {});

    useEffect(() => {
        const nav = navigator as NavigatorWithWakeLock;

        const releaseLock = async () => {
            try {
                lockRef.current?.removeEventListener('release', releaseHandler.current);
                await lockRef.current?.release();
            } catch {}
            lockRef.current = null;
        };

        if (!enabled) {
            releaseLock();
            return;
        }



        const requestWakeLock = async () => {
            try {
                if (!nav.wakeLock) {
                    console.warn('Wake Lock not supported on this browser.');
                    return;
                }
                const lock = await nav.wakeLock.request('screen');
                lockRef.current = lock;

                const handleRelease = () => {
                    requestWakeLock(); // try to reacquire
                };

                releaseHandler.current = handleRelease;
                lock.addEventListener('release', handleRelease);
            } catch (err) {
                console.error('Wake lock request failed:', err);
            }
        };

        requestWakeLock();

        return () => {
            releaseLock();
        };
    }, [enabled]);
}
