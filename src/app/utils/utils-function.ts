export function isNotNull(value: any) {
    return (value) ? true : false;
}

export function isNull(value: any): boolean {
    return !isNotNull(value);
}

export function isNotBlank(value: string): boolean | any {
    return value && value.trim().length > 0;
}