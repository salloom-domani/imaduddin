/** "18 May 2024" */
export function formatGregorian(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * "9 Dhuʻl-Qiʻdah 1445" via the Umm al-Qura Islamic calendar.
 * Strips the trailing " AH" era suffix. Returns '' if Intl lacks the
 * islamic calendar (older Hermes) — caller can fall back to a dep.
 */
export function formatHijri(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return formatted.replace(/\s*AH\b/, '').trim();
  } catch {
    return '';
  }
}
