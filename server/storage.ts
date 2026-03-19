// Minimal storage interface - data is served from JSON
export interface IStorage {}

export class MemStorage implements IStorage {}

export const storage = new MemStorage();
