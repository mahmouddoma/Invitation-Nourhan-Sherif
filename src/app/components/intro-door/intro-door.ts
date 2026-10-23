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

      // Royal Minimalist Choreographed Entrance Animation
      if (!this.animationService.prefersReducedMotion) {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl.fromTo(
          '.corner-pearl-tr',
          { opacity: 0, scale: 0.88, rotation: 4 },
          { opacity: 1, scale: 1, rotation: 0, duration: 1.0, ease: 'power3.out' },
        )
          .fromTo(
            '.corner-pearl-bl',
            { opacity: 0, scale: 0.88, rotation: -6 },
            { opacity: 1, scale: 1, rotation: 0, duration: 1.0, ease: 'power3.out' },
            '-=0.85',
          )
          .fromTo(
            '.top-controls',
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
            '-=0.6',
          )
          .fromTo(
            '.royal-monogram-stage',
            { opacity: 0, scale: 0.94 },
            { opacity: 1, scale: 1, duration: 0.85, ease: 'power2.out' },
            '-=0.45',
          )
          .fromTo(
            '.mono-editorial-eyebrow',
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.4',
          )
          .fromTo(
            '.mono-arabic-names',
            { opacity: 0, y: 12, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' },
            '-=0.35',
          )
          .fromTo(
            '.mono-script-names',
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
            '-=0.35',
          )
          .fromTo(
            '.mono-date-row',
            { opacity: 0, scale: 0.95, y: 6 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3',
          )
          .fromTo(
            '.wax-seal-interactive-anchor',
            { opacity: 0, scale: 0.45, rotation: -12 },
            { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(1.8)' },
            '-=0.3',
          );
      }

      // Try autoplay on page load and setup gesture triggers
      this.setupAudioAutoplay();
    });
  }

  private audioContext: AudioContext | null = null;
  private readonly interactionEvents = [
    'pointerdown',
    'touchstart',
    'touchend',
    'click',
    'mousedown',
    'mouseup',
    'keydown',
    'scroll',
    'wheel',
    'pointermove',
  ];

  private setupAudioAutoplay(): void {
    if (!this.audioEl) return;

    this.audioEl.load();

    // 1. Attempt standard unmuted play immediately
    this.playAudioDirectly();

    // 2. Setup universal user-gesture listeners across window and document
    this.userInteractionHandler = () => {
      this.unlockAndPlay();
    };

    this.interactionEvents.forEach((evt) => {
      window.addEventListener(evt, this.userInteractionHandler!, { capture: true, passive: true });
      document.addEventListener(evt, this.userInteractionHandler!, {
        capture: true,
        passive: true,
      });
    });
  }

  private unlockAndPlay(): void {
    if (this.musicPlaying()) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }
    } catch { }

    this.playAudioDirectly();
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
          this.removeInteractionListener();
        })
        .catch(() => {
          // If browser blocked unmuted autoplay without gesture,
          // will unlock on first touch/move/scroll
        });
    }
  }

  /** Called when the user clicks or touches the screen */
  onScreenClick(): void {
    if (!this.musicPlaying()) {
      this.unlockAndPlay();
    }
  }

  private removeInteractionListener(): void {
    if (this.userInteractionHandler) {
      this.interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, this.userInteractionHandler!, { capture: true } as any);
        document.removeEventListener(evt, this.userInteractionHandler!, { capture: true } as any);
      });
      this.userInteractionHandler = null;
    }
  }

  /** Step: User taps the wax seal -> Unlocks, smoothly dissolves intro, plays music, reveals inner invitation */
  openDoor(): void {
    if (this.isOpen() || this.isOpening()) return;

    this.isOpening.set(true);
    this.unlockAndPlay();

    if (this.animationService.prefersReducedMotion) {
      this.isOpen.set(true);
      this.doorOpened.emit();
      return;
    }

    // After the smooth dissolving sequence completes (approx 850ms), transition to main page
    setTimeout(() => {
      this.isOpen.set(true);
      this.doorOpened.emit();
    }, 850);
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
