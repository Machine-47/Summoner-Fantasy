import { Injectable } from '@angular/core';

export type League = {
  id: string;
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  icon?: string;
  mode: 'pickem' | 'draft';
};

@Injectable({ providedIn: 'root' })
export class LeaguesService {
  private lol: League[] = [
    { id: 'worlds-draft',  slug: 'worlds-draft',  badge: 'DRAFT FANTASY LOL', title: 'Fantasy Worlds (Draft)', subtitle: 'Crea tu equipo y compite por puntos', mode: 'draft' },
    { id: 'worlds-pickem', slug: 'worlds-pickem', badge: 'PREDICE EL MUNDIAL', title: 'Worlds Pick’em',        subtitle: 'Haz tus selecciones para el Mundial', mode: 'pickem' },
    { id: 'lec-pickem',    slug: 'lec-pickem',    badge: 'PICK’EM LOL',       title: 'LEC Pick’em',            subtitle: 'Predice resultados de la LEC',       mode: 'pickem' },
  ];

  getLolLeagues() { return this.lol; }
  getBySlug(slug: string) { return this.lol.find(x => x.slug === slug); }
}
