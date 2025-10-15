import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { LucideAngularModule, Camera, Search, Eye, Star, Plus, X, Phone, Mail, User, Menu, Palette, Home, Shield } from 'lucide-angular';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  readonly Camera = Camera;
  readonly Search = Search;
  readonly Eye = Eye;
  readonly Star = Star;
  readonly Plus = Plus;
  readonly X = X;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly User = User;
  readonly Menu = Menu;
  readonly Palette = Palette;
  readonly Home = Home;
  readonly Shield = Shield;
  
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  selectedProduct = signal<Product | null>(null);
  showModal = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  backgroundClicks = signal<number[]>([0, 0]);
  currentSlide = signal<number>(0);



  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
      this.startSlideshow();
    }
  }



  loadProducts(): void {
    this.loading.set(true);
    
    this.apiService.getProducts({
      status: 'APPROVED',
      search: this.searchTerm(),
      page: this.currentPage(),
      limit: 12
    }).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadProducts();
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

  viewProduct(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedProduct.set(product);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedProduct.set(null);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  startSlideshow(): void {
    setInterval(() => {
      this.currentSlide.update(current => (current + 1) % 2);
      this.updateSlides();
    }, 5000); // Change toutes les 5 secondes
  }

  updateSlides(): void {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
      if (index === this.currentSlide()) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  onBackgroundImageClick(imageIndex: number): void {
    const currentClicks = this.backgroundClicks();
    currentClicks[imageIndex - 1]++;
    this.backgroundClicks.set([...currentClicks]);
  }

  isProductOwner(product: Product): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.id === product.seller.id;
  }

  editProduct(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // Rediriger vers la page de vente avec l'ID du produit pour modification
    this.router.navigate(['/sell'], { queryParams: { edit: product.id } });
  }

}
