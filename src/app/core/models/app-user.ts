export interface AppUser {
  id: string;
  email: string;
  name?: string;
  displayName?: string;   // opcional: algunos endpoints lo devuelven así
  avatarUrl?: string;
}
