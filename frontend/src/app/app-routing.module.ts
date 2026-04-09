import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'patients',
    loadChildren: () => import('./features/patients/patients.module').then(m => m.PatientsModule)
  },
  {
    path: 'sessions',
    loadChildren: () => import('./features/sessions/sessions.module').then(m => m.SessionsModule)
  },
  {
    path: 'execution',
    loadChildren: () => import('./features/execution/execution.module').then(m => m.ExecutionModule)
  },
  {
    path: 'results',
    loadChildren: () => import('./features/results/results.module').then(m => m.ResultsModule)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
