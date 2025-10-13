// -------------------------------------------------------------
export interface Team {
id: string;
name: string;
acronym?: string; // ej. GEN, TES, G2
region: string;
logoUrl?: string;
players?: string[]; // ids (relación simple)
}