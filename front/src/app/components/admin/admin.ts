import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { LucideAngularModule, Camera, User, Eye, Home, LogOut, RefreshCw, CheckCircle, XCircle, Trash2, Clock, Calendar, Shield, X } from 'lucide-angular';
import { NoDownloadDirective } from '../../directives/no-download.directive';
import { NotificationService } from '../../services/notification.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink, LucideAngularModule, NoDownloadDirective, NotificationBellComponent, ThemeSelectorComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  readonly Camera = Camera;
  readonly User = User;
  readonly Eye = Eye;
  readonly Home = Home;
  readonly LogOut = LogOut;
  readonly RefreshCw = RefreshCw;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Trash2 = Trash2;
  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly Shield = Shield;
  readonly X = X;

  private apiService = inject(ApiService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loading = signal<boolean>(false);
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  showModal = signal<boolean>(false);
  currentView = signal<'pending' | 'approved'>('pending');

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPendingProducts();
  }

  loadPendingProducts(): void {
    this.currentView.set('pending');
    this.loading.set(true);

    this.apiService.getPendingProducts().subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.loading.set(false);
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  loadApprovedProducts(): void {
    this.currentView.set('approved');
    this.loading.set(true);

    this.apiService.getProducts({ status: 'APPROVED' }).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.loading.set(false);
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  switchView(view: 'pending' | 'approved'): void {
    if (view === 'pending') {
      this.loadPendingProducts();
    } else {
      this.loadApprovedProducts();
    }
  }

  viewProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.showModal.set(true);
  }

  approveProduct(product: Product): void {
    this.apiService.approveProduct(product.id).subscribe({
      next: (updatedProduct) => {
        this.notificationService.success('Produit approuvé avec succès');
        this.closeModal();
        this.loadPendingProducts(); // Recharger la liste
      },
      error: (error: any) => {
        console.error('Erreur approbation:', error);
        this.notificationService.error('Erreur lors de l\'approbation du produit');
      }
    });
  }

  rejectProduct(product: Product): void {
    const reason = prompt('Raison du rejet (optionnel):');
    this.apiService.rejectProduct(product.id, reason || undefined).subscribe({
      next: (updatedProduct) => {
        this.notificationService.success('Produit rejeté');
        this.closeModal();
        this.loadPendingProducts(); // Recharger la liste
      },
      error: (error: any) => {
        console.error('Erreur rejet:', error);
        this.notificationService.error('Erreur lors du rejet du produit');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedProduct.set(null);
  }

  deleteProduct(product: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.title}" ?`)) {
      this.apiService.deleteProduct(product.id).subscribe({
        next: () => {
          this.notificationService.success('Produit supprimé avec succès');
          this.loadPendingProducts(); // Recharger la liste
        },
        error: (error: any) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur lors de la suppression du produit');
        }
      });
    }
  }

  getPrimaryPhoto(product: Product): string {
    if (!product.photos || product.photos.length === 0) {
      return '/placeholder.svg';
    }

    const primary = product.photos.find(p => p.isPrimary);
    const photoUrl = primary?.url || product.photos[0]?.url;

    // Si l'URL est une URL complète (Cloudinary), la retourner telle quelle
    if (photoUrl && photoUrl.startsWith('http')) {
      return photoUrl;
    }

    // Pour la compatibilité avec les anciennes URLs locales
    if (photoUrl && photoUrl.startsWith('/uploads')) {
      return photoUrl;
    }

    return '/placeholder.svg';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getPendingCount(): number {
    return this.products().filter(p => p.status === 'PENDING').length;
  }

  getApprovedCount(): number {
    return this.products().filter(p => p.status === 'APPROVED').length;
  }
}
