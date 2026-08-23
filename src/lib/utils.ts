import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MEDIA_FALLBACKS } from "@/lib/media-manifest";

/**
 * Объединяет классы Tailwind, решая конфликты (например, p-4 + p-8 -> p-8)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const FALLBACK_PC_IMAGE = MEDIA_FALLBACKS.pc;

export function getSafeImage(src: string | null | undefined, fallback = FALLBACK_PC_IMAGE) {
    const value = src?.trim();
    if (!value || value.includes("placeholder_pc")) return fallback;
    return value;
}

export function getSafeImages(images: Array<string | null | undefined> | null | undefined, fallback = FALLBACK_PC_IMAGE) {
    const safeImages = (images || [])
        .map((image) => getSafeImage(image, fallback))
        .filter(Boolean);

    return safeImages.length > 0 ? safeImages : [fallback];
}

export function isRemoteImage(src: string | null | undefined) {
    return typeof src === "string" && /^https?:\/\//i.test(src);
}
