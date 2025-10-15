import { Component, signal, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector';
import { LucideAngularModule, Home, User, Plus, Shield, ChevronDown, LogOut, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, ThemeSelectorComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly Home = Home;
  readonly User = User;
  readonly Plus = Plus;
  readonly Shield = Shield;
  readonly ChevronDown = ChevronDown;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  showUserMenu = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Fermer les menus quand on clique ailleurs
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-menu')) {
          this.showUserMenu.set(false);
        }
      });
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'MODERATOR': return 'Modérateur';
      case 'SELLER': return 'Vendeur';
      default: return 'Utilisateur';
    }
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
    this.mobileMenuOpen.set(false);
  }
}