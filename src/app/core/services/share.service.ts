import { Injectable, signal } from '@angular/core';
import { WEDDING_CONFIG } from '../wedding.config';

/**
 * Handles sharing via Web Share API with fallbacks for specific platforms.
 * Also provides clipboard copy with toast notification support.
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  /** Visible toast message — empty string means hidden */
  readonly toastMessage = signal('');

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Show a toast message for 2.5 seconds */
  showToast(message: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set(message);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set('');
    }, 2500);
  }

  /** Get the invitation URL (current page) */
  private getInvitationUrl(): string {
    return window.location.href;
  }

  /** Get the share text */
  private getShareText(): string {
    return `دعوة زفاف ${WEDDING_CONFIG.brideName} ♡ ${WEDDING_CONFIG.groomName} — الجمعة 23 أكتوبر 2026 الساعة 7:30 مساءً في قاعة بورتوسيف`;
  }

  /** Native Web Share API */
  async shareNative(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `دعوة زفاف ${WEDDING_CONFIG.brideName} و ${WEDDING_CONFIG.groomName}`,
          text: this.getShareText(),
          url: this.getInvitationUrl(),
        });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      await this.copyLink();
    }
  }

  /** Share via WhatsApp */
  shareWhatsApp(): void {
    const text = encodeURIComponent(`${this.getShareText()}\n${this.getInvitationUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  /** Share via Facebook */
  shareFacebook(): void {
    const url = encodeURIComponent(this.getInvitationUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  /** Share via X (Twitter) */
  shareX(): void {
    const text = encodeURIComponent(this.getShareText());
    const url = encodeURIComponent(this.getInvitationUrl());
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  /** Copy link for Instagram/TikTok (no deep link API) */
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getInvitationUrl());
      this.showToast('تم نسخ رابط الدعوة ✓');
    } catch {
      this.showToast('تعذر نسخ الرابط');
    }
  }

  /** Copy location link */
  async copyLocationLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(WEDDING_CONFIG.locationUrl);
      this.showToast('تم نسخ رابط اللوكيشن ✓');
    } catch {
      this.showToast('تعذر نسخ الرابط');
    }
  }

  /** Share location via Web Share API */
  async shareLocation(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `موقع حفل زفاف ${WEDDING_CONFIG.groomName} و ${WEDDING_CONFIG.brideName}`,
          text: `موقع الحفل — ${WEDDING_CONFIG.venueName}، ${WEDDING_CONFIG.venueAddress}`,
          url: WEDDING_CONFIG.locationUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await this.copyLocationLink();
    }
  }

  /** Open location in maps */
  openLocation(): void {
    window.open(WEDDING_CONFIG.locationUrl, '_blank');
  }
}
