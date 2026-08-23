export function normalizeComponentUnits(value: string) {
    return value
        .replace(/(\d+)\s*(?:гб|gb)(?![a-zа-я])/gi, "$1GB")
        .replace(/(\d+)\s*(?:тб|tb)(?![a-zа-я])/gi, "$1TB")
        .replace(/(\d+)\s*(?:мгц|mhz)(?![a-zа-я])/gi, "$1MHz")
        .replace(/(\d+)\s*(?:ггц|ghz)(?![a-zа-я])/gi, "$1GHz")
        .replace(/\bPCIE\b/g, "PCIe");
}
