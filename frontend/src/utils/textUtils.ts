export function normalizeTextForSearch(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
