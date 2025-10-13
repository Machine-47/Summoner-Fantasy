export type Role = 'TOP'|'JUNGLE'|'MID'|'ADC'|'SUPPORT';


export interface TeamRef {
id: string;
name: string;
region: string; // ej. LEC, LCK, LPL, LCS, PCS...
}


export interface Player {
id: string; // id interno o de la API de esports
summonerName: string; // nick del jugador
fullName?: string;
role: Role;
team: TeamRef;
country?: string; // para filtrar por países
photoUrl?: string;
stats?: {
kda?: number;
kpr?: number; // kill participation rate
dpm?: number; // daño por minuto
cspm?: number; // cs por minuto
};
}