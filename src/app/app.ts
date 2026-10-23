import { Component, signal, inject, afterNextRender } from '@angular/core';
import { IntroDoorComponent } from './components/intro-door/intro-door';
import { HeroComponent } from './components/hero/hero';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer';
import { LocationSectionComponent } from './components/location-section/location-section';
import { AddToCalendarComponent } from './components/add-to-calendar/add-to-calendar';
import { ShareSectionComponent } from './components/share-section/share-section';
import { ClosingSectionComponent } from './components/closing-section/closing-section';
import { ShareService } from './core/services/share.service';

@Component({
  selector: 'app-root',
  imports: [
    IntroDoorComponent,
    HeroComponent,
    CountdownTimerComponent,
    LocationSectionComponent,
    AddToCalendarComponent,
    ShareSectionComponent,
    ClosingSectionComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '[class.door-open]': 'doorOpen()',
    '[class.intro-active]': '!doorOpen()',
  },
})
export class App {
  /** Whether the intro door has been opened */
  readonly doorOpen = signal(false);

  /** Toast service for clipboard feedback */
  readonly shareService = inject(ShareService);

  constructor() {
    afterNextRender(() => {
      if (!this.doorOpen()) {
        document.documentElement.classList.add('intro-active');
        document.body.classList.add('intro-active');
      }
    });
  }

  onDoorOpened(): void {
    this.doorOpen.set(true);
    document.documentElement.classList.remove('intro-active');
    document.body.classList.remove('intro-active');
  }
}

