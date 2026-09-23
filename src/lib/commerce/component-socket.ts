type SocketPart = { name: string; socket?: string; specs: Record<string, string> };

/** Only use explicit socket metadata, never infer a platform from a brand. */
export function componentSocket(part: SocketPart | undefined): string | null {
  const value = (part?.socket || part?.specs.Socket || "").toUpperCase().replace(/\s+/g, "");
  return /^(AM[345]|LGA\d{3,4}|STR[45]|STRX4|TR4)$/.test(value) ? value : null;
}

export function socketConflict(cpu: SocketPart | undefined, board: SocketPart | undefined): string | null {
  const cpuSocket = componentSocket(cpu);
  const boardSocket = componentSocket(board);
  return cpuSocket && boardSocket && cpuSocket !== boardSocket
    ? `Несовместимый сокет: процессору ${cpu!.name} нужна плата ${cpuSocket}, а выбрана ${board!.name} (${boardSocket}). Замените процессор или материнскую плату.`
    : null;
}
