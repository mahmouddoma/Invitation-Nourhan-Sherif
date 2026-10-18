import {
  Component,
  output,
  signal,
  afterNextRender,
  inject,
  PLATFORM_ID,
  ElementRef,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WEDDING_CONFIG } from '../../core/wedding.config';
import { AnimationService } from '../../core/services/animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-intro-door',
  standalone: true,
  templateUrl: './intro-door.html',
  styleUrl: './intro-door.css',
})
export class IntroDoorComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly animationService = inject(AnimationService);

  readonly config = WEDDING_CONFIG;
  readonly doorOpened = output<void>();
  readonly isOpen = signal(false);
  readonly isOpening = signal(false);
  readonly musicPlaying = signal(false);

  readonly doorWrapRef = viewChild<ElementRef>('doorWrapEl');
  readonly leftLeafRef = viewChild<ElementRef>('leftLeafEl');
  readonly rightLeafRef = viewChild<ElementRef>('rightLeafEl');
  readonly openBtnRef = viewChild<ElementRef>('openBtnEl');

  private audioEl: HTMLAudioElement | null = null;
  private userInteractionHandler: ((e?: Event) => void) | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      this.animationService.init();
      this.audioEl = document.getElementById('wedding-audio') as HTMLAudioElement;

      if (this.audioEl) {
        this.audioEl.muted = false;
        this.audioEl.volume = 1.0;
      }

      // Pulse lock animation
      const openBtn = this.openBtnRef()?.nativeElement;
      if (openBtn && !this.animationService.prefersReducedMotion) {
        gsap.to(openBtn, {
          y: -4,
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }

      // Try autoplay on page load and setup gesture triggers
      this.setupAudioAutoplay();
    });
  }

  private setupAudioAutoplay(): void {
    if (!this.audioEl) return;

    // 1. Attempt standard unmuted play
    this.playAudioDirectly();

    // 2. Setup universal user-gesture listeners across window and document
    this.userInteractionHandler = () => {
      this.playAudioDirectly();
      this.removeInteractionListener();
    };

    const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];
    events.forEach((evt) => {
      window.addEventListener(evt, this.userInteractionHandler!, { capture: true, once: true });
      document.addEventListener(evt, this.userInteractionHandler!, { capture: true, once: true });
    });
  }

  private playAudioDirectly(): void {
    if (!this.audioEl) return;

    this.audioEl.muted = false;
    this.audioEl.volume = 1.0;

    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.musicPlaying.set(true);
        })
        .catch(() => {
          // Will be unlocked on first user tap/click
        });
    }
  }

  /** Called when the user clicks or touches the screen */
  onScreenClick(): void {
    if (!this.musicPlaying()) {
      this.playAudioDirectly();
    }
  }

  private removeInteractionListener(): void {
    if (this.userInteractionHandler) {
      const events = ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];
      events.forEach((evt) => {
        window.removeEventListener(evt, this.userInteractionHandler!, { capture: true } as any);
        document.removeEventListener(evt, this.userInteractionHandler!, { capture: true } as any);
      });
      this.userInteractionHandler = null;
    }
  }

  /** Step: User taps the lock -> Unlocks, Arch opens in 3D, preview revealed, music plays */
  openDoor(): void {
    if (this.isOpen() || this.isOpening()) return;

    this.isOpening.set(true);
    this.playAudioDirectly();

    if (this.animationService.prefersReducedMotion) {
      this.isOpen.set(true);
      this.doorOpened.emit();
      return;
    }

    // After the card opening sequence completes (approx 1.1s), transition to main page
    setTimeout(() => {
      this.isOpen.set(true);
      this.doorOpened.emit();
    }, 1100);
  }

  /** Toggle background music */
  toggleMusic(): void {
    if (!this.audioEl) return;
    if (this.musicPlaying()) {
      this.audioEl.pause();
      this.musicPlaying.set(false);
    } else {
      this.playAudioDirectly();
    }
  }

  ngOnDestroy(): void {
    this.removeInteractionListener();
  }
}
