import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

export const adminGuard: CanActivateFn = () => {
   const router = inject(Router);
  const auth = inject(AuthService);
  

if(auth.isAdminAuthenticated()&&auth.isAdmin())
  return true;
  router.navigate(['/admin-login']);
  return false;
};