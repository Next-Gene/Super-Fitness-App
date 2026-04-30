import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent],
  template: `
<div class="layout-container">
  <app-header />

  <main class="main-content">
    <router-outlet />
  </main>

  <app-footer />
</div>
  `,
  styles: [`
  .layout-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  }

  .main-content {
    flex: 1;
    padding-top: 64px;
  }
  `]
})
export class LayoutComponent {}