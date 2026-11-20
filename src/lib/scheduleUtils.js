export const DEFAULT_SETTINGS = {
  startTime: '12:00',
  intervalMinutes: 15,
  pdfTitle: 'EMW Project Scheduler',
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" into minutes since midnight. Returns null when invalid. */
export function parseTimeToMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes-since-midnight as a 12-hour time (numerical arithmetic only). */
export function formatMinutes(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(total / 60);
  const minutesPart = total % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const period = hours24 < 12 ? 'AM' : 'PM';
  return `${hours12}:${String(minutesPart).padStart(2, '0')} ${period}`;
}

export function getPresentationTime(index, settings) {
  const startMinutes = parseTimeToMinutes(settings.startTime);
  const interval = Number(settings.intervalMinutes);
  const safeStart = startMinutes === null ? parseTimeToMinutes(DEFAULT_SETTINGS.startTime) : startMinutes;
  const safeInterval =
    Number.isFinite(interval) && interval >= 1 ? interval : DEFAULT_SETTINGS.intervalMinutes;
  return formatMinutes(safeStart + index * safeInterval);
}

/**
 * The project array is the single source of truth. Group numbers and times
 * are derived here and are never stored.
 */
export function withSchedule(projects, settings) {
  return projects.map((project, index) => ({
    ...project,
    groupNumber: index + 1,
    presentationTime: getPresentationTime(index, settings),
  }));
}
