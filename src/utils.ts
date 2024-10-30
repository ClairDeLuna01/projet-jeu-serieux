import { Vector2 } from "@math.gl/core";

export function rotate_around_axis(point: Vector2, angle: number, axis: Vector2): Vector2 {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    const x = point.x - axis.x;
    const y = point.y - axis.y;

    const x_new = x * c - y * s;
    const y_new = x * s + y * c;

    return new Vector2([x_new + axis.x, y_new + axis.y]);
}

export class CancelableDelay {
    private timeoutId: number | null = null;
    private rejectFn: ((reason?: any) => void) | null = null;
    private resolveFn: (() => void) | null = null;
    private canceled = false;

    delay(ms: number): Promise<void> {
        // Cancel any existing delay
        this.cancel();

        return new Promise<void>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
            this.canceled = false;
            this.timeoutId = window.setTimeout(() => {
                if (!this.canceled) {
                    resolve();
                }
                this.clear();
            }, ms);
        });
    }

    cancel(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
            this.canceled = true;
            if (this.resolveFn) {
                // Resolve the promise to prevent uncaught errors
                this.resolveFn();
            }
            // console.log("Canceled");
            this.clear();
        }
    }

    private clear(): void {
        this.timeoutId = null;
        this.rejectFn = null;
        this.resolveFn = null;
        this.canceled = false;
    }

    isPending(): boolean {
        return this.timeoutId !== null;
    }
}

export function formatMoney(value: number): string {
    const suffixes = ["", "K", "M", "B", "T", "Q"];

    let suffixIndex = 0;
    for (; Math.abs(value) >= 1000; value /= 1000, suffixIndex++);

    // console.log(value, suffixIndex);

    return "$" + Math.floor(value * 100) / 100 + suffixes[suffixIndex];
}

export function isAsciiPrintable(keycode: string): boolean {
    return keycode.length === 1 && keycode.charCodeAt(0) >= 32 && keycode.charCodeAt(0) <= 126;
}

export function isExtendedAsciiPrintable(keycode: string): boolean {
    return keycode.length === 1 && keycode.charCodeAt(0) >= 32 && keycode.charCodeAt(0) <= 255;
}

export const cardImages: { [key: string]: HTMLImageElement } = {};
export function preloadCardImage(url: string): void {
    const img = new Image();
    img.src = url;
    cardImages[url] = img;
}
