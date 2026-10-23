
/**
 * Central wedding configuration — edit all wedding data from this one file.
 * No component code needs to change when updating names, dates, or links.
 */

export interface WeddingConfig {
  groomName: string;
  brideName: string;
  groomFather: string;
  brideFather: string;
  weddingDate: string; // ISO 8601
  weddingTime: string; // display string
  venueName: string;
  venueAddress: string;
  locationUrl: string;
  locationQrImage: string;
  invitationTitle: string;
  bismillah: string;
  quranVerse: string;
  invitationIntro: string;
  invitationSubline: string;
  closingMessage: string;
  closingSubMessage: string;
  audioSrc: string;
}

export const WEDDING_CONFIG: WeddingConfig = {
  groomName: 'شريف',
  brideName: 'نورهان',
  groomFather: 'أ / عصام عيد',
  brideFather: 'أ / محمد الشحات',
  weddingDate: '2026-11-13T20:00:00',
  weddingTime: 'الساعة 8:00 مساءً',
  venueName: 'قاعة هيلتون',
  venueAddress: 'Hilton',
  locationUrl: 'https://maps.app.goo.gl/sYoVgyYdXJDAm1kq5',
  locationQrImage: 'location_qr.png',
  invitationTitle: 'دعوة زفاف',
  bismillah: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
  quranVerse:
    'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنْفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
  invitationIntro: 'يسعدنا ويشرفنا دعوتكم لحضور حفل زفاف',
  invitationSubline: 'فرحتنا هتكمل بوجودكم معانا وبدعواتكم الحلوة',
  closingMessage: 'وجودكم يتمم فرحتنا',
  closingSubMessage: 'فرحتنا متكملش إلا بيكم، مستنيين نشوفكم ونسعد بوجودكم جنبنا في أحلى يوم',
  audioSrc: 'wedding-song.mp3',
};

