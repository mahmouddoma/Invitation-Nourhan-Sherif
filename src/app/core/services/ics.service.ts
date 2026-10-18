import { Injectable } from '@angular/core';
import { WEDDING_CONFIG } from '../wedding.config';

/**
 * Generates a downloadable .ics calendar file for the wedding event.
 * Compatible with Google Calendar, Apple Calendar, and Outlook.
 */
@Injectable({ providedIn: 'root' })
export class IcsService {
  /** Generate and download the .ics file */
  downloadIcs(): void {
    const icsContent = this.generateIcs();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `wedding-${WEDDING_CONFIG.brideName}-${WEDDING_CONFIG.groomName}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private generateIcs(): string {
    const startDate = new Date(WEDDING_CONFIG.weddingDate);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4-hour event

    const formatDate = (d: Date): string => {
      return d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    };

    const now = new Date();

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `DTSTAMP:${formatDate(now)}`,
      `UID:wedding-${WEDDING_CONFIG.brideName}-${WEDDING_CONFIG.groomName}@invitation`,
      `SUMMARY:حفل زفاف ${WEDDING_CONFIG.brideName} و ${WEDDING_CONFIG.groomName}`,
      `DESCRIPTION:يتشرف الأهل بدعوتكم لحضور حفل زفاف ${WEDDING_CONFIG.brideName} و ${WEDDING_CONFIG.groomName}\\n📍 ${WEDDING_CONFIG.venueName}\\n🗺️ ${WEDDING_CONFIG.venueAddress}`,
      `LOCATION:${WEDDING_CONFIG.venueName}\, ${WEDDING_CONFIG.venueAddress}`,
      `URL:${WEDDING_CONFIG.locationUrl}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:حفل زفاف ${WEDDING_CONFIG.brideName} و ${WEDDING_CONFIG.groomName} بعد ساعة`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
