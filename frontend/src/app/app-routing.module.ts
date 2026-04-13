import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'patients',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/patients/patients.module').then(m => m.PatientsModule)
  },
  {
    path: 'sessions',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/sessions/sessions.module').then(m => m.SessionsModule)
  },
  {
    path: 'execution',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/execution/execution.module').then(m => m.ExecutionModule)
  },
  {
    path: 'results',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/results/results.module').then(m => m.ResultsModule)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
