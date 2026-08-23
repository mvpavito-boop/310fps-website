export type JsonRecord = Record<string, unknown>;

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function assertRecord(value: unknown, label = 'payload'): asserts value is JsonRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ValidationError(`${label} must be an object`);
    }
}

export function hasOwn(body: JsonRecord, key: string) {
    return Object.prototype.hasOwnProperty.call(body, key);
}

export function requiredString(body: JsonRecord, key: string) {
    const value = body[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new ValidationError(`${key} is required`);
    }
    return value.trim();
}

export function optionalString(body: JsonRecord, key: string) {
    if (!hasOwn(body, key)) return undefined;
    const value = body[key];
    if (value === null || value === '') return null;
    if (typeof value !== 'string') throw new ValidationError(`${key} must be a string`);
    return value;
}

export function requiredNumber(body: JsonRecord, key: string) {
    const value = body[key];
    const numberValue = typeof value === 'string' ? Number(value) : value;
    if (typeof numberValue !== 'number' || !Number.isFinite(numberValue)) {
        throw new ValidationError(`${key} must be a number`);
    }
    return numberValue;
}

export function optionalNumber(body: JsonRecord, key: string) {
    if (!hasOwn(body, key)) return undefined;
    const value = body[key];
    if (value === null || value === '') return null;
    const numberValue = typeof value === 'string' ? Number(value) : value;
    if (typeof numberValue !== 'number' || !Number.isFinite(numberValue)) {
        throw new ValidationError(`${key} must be a number`);
    }
    return numberValue;
}

export function optionalBoolean(body: JsonRecord, key: string) {
    if (!hasOwn(body, key)) return undefined;
    const value = body[key];
    if (typeof value !== 'boolean') throw new ValidationError(`${key} must be a boolean`);
    return value;
}

export function optionalRecord(body: JsonRecord, key: string, fallback: JsonRecord = {}) {
    if (!hasOwn(body, key)) return fallback;
    const value = body[key];
    if (value === null) return fallback;
    assertRecord(value, key);
    return value;
}

export function optionalStringArray(body: JsonRecord, key: string, fallback: string[] = []) {
    if (!hasOwn(body, key)) return fallback;
    const value = body[key];
    if (value === null) return fallback;
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
        throw new ValidationError(`${key} must be an array of strings`);
    }
    return value;
}

export function validationErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Invalid request';
}

export function unknownErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim().length > 0) return message;
    }
    return 'Unknown error';
}
