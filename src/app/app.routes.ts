import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
{ path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
{ path: 'players', loadComponent: () => import('./features/players/players.page').then(m => m.PlayersPage) },
{ path: 'players/:id', loadComponent: () => import('./features/players/player-detail.component').then(m => m.PlayerDetailComponent) },
{ path: 'teams', loadComponent: () => import('./features/teams/teams.page').then(m => m.TeamsPage) },
{ path: 'schedule', loadComponent: () => import('./features/schedule/schedule.page').then(m => m.SchedulePage) },
{ path: 'leagues', loadComponent: () => import('./features/leagues/leagues.page').then(m => m.LeaguesPage) },
{ path: 'leagues/:slug', loadComponent: () => import('./features/leagues/league-detail.page').then(m => m.LeagueDetailPage) },

{ path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage) },
{ path: 'my-team', canActivate: [authGuard], loadComponent: () => import('./features/my-team/my-team.page').then(m => m.MyTeamPage) },
{ path: 'login', loadComponent: () => import('./features/auth/login.page').then(m => m.LoginPage) },
{ path: 'register', loadComponent: () => import('./features/auth/register.page').then(m => m.RegisterPage) },
{ path: '**', redirectTo: '' }
];
