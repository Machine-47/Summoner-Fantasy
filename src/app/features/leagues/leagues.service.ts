// src/app/features/leagues/leagues.service.ts
import { Injectable } from '@angular/core';

export type League = {
  id: string;
  slug: string;           // para detail route
  badge: string;          // texto pequeño arriba (ej: PREDICE … / DRAFT …)
  title: string;          // nombre grande
  subtitle: string;       // descripción corta
  icon?: string;          // opcional
  mode: 'pickem' | 'draft';
};

@Injectable({ providedIn: 'root' })
export class LeaguesService {
  // De ejemplo: Worlds, LEC, LCK… (puedes añadir más)
  private lol: League[] = [
    {
      id: 'worlds-pickem',
      slug: 'worlds-pickem',
      badge: 'PREDICE EL MUNDIAL',
      title: 'Worlds Pick’em',
      subtitle: 'Haz tus selecciones para el Mundial',
      mode: 'pickem',
    },
    {
      id: 'worlds-draft',
      slug: 'worlds-draft',
      badge: 'DRAFT FANTASY LOL',
      title: 'Fantasy Worlds (Draft)',
      subtitle: 'Crea tu equipo y compite por puntos',
      mode: 'draft',
    },
    {
      id: 'lec-pickem',
      slug: 'lec-pickem',
      badge: 'PICK’EM LOL',
      title: 'LEC Pick’em',
      subtitle: 'Predice resultados de la LEC',
      mode: 'pickem',
    },
  ];

  getLolLeagues(): League[] {
    return this.lol;
  }

  getBySlug(slug: string): League | undefined {
    return [...this.lol].find(x => x.slug === slug);
  }
}
