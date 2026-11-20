import { createDefaultState } from './defaultDataset.js';
import { createId } from './id.js';
import { DEFAULT_SETTINGS, parseTimeToMinutes } from './scheduleUtils.js';

export const STORAGE_KEY = 'project-scheduler:v1';
export const SCHEMA_VERSION = 1;

const MAX_SECTION = 9999;
const MAX_INTERVAL = 1440;

export function defaultState() {
  return createDefaultState();
}

function cleanId(value, prefix) {
  return typeof value === 'string' && value.trim() ? value : createId(prefix);
}

function cleanSection(value) {
  const numeric = typeof value === 'string' ? Number(value.trim()) : value;
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > MAX_SECTION) return null;
  return numeric;
}

/**
 * Validates and upgrades stored/imported data.
 * Migration policy: data without a version is treated as v1-shaped legacy data;
 * derived fields (group numbers, times) from older versions are discarded.
 * Unknown newer versions are rejected so they are never overwritten.
 */
export function normalizeState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (raw.version !== undefined && raw.version !== SCHEMA_VERSION) return null;
  if (!Array.isArray(raw.projects)) return null;

  const rawSettings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const startTime =
    typeof rawSettings.startTime === 'string' &&
    parseTimeToMinutes(rawSettings.startTime) !== null
      ? rawSettings.startTime.trim()
      : DEFAULT_SETTINGS.startTime;
  const intervalCandidate = Number(rawSettings.intervalMinutes);
  const intervalMinutes =
    Number.isInteger(intervalCandidate) && intervalCandidate >= 1 && intervalCandidate <= MAX_INTERVAL
      ? intervalCandidate
      : DEFAULT_SETTINGS.intervalMinutes;
  // Missing in older backups: fall back to the default. An intentionally empty
  // string is preserved so the user can turn the PDF title off.
  const pdfTitle =
    typeof rawSettings.pdfTitle === 'string'
      ? rawSettings.pdfTitle.trim().slice(0, 120)
      : DEFAULT_SETTINGS.pdfTitle;

  const projects = [];
  for (const rawProject of raw.projects) {
    if (!rawProject || typeof rawProject !== 'object' || Array.isArray(rawProject)) continue;
    const name = typeof rawProject.name === 'string' ? rawProject.name.trim() : '';
    if (!name) continue;

    const rawStudents = Array.isArray(rawProject.students) ? rawProject.students : [];
    const students = [];
    for (const rawStudent of rawStudents) {
      if (!rawStudent || typeof rawStudent !== 'object' || Array.isArray(rawStudent)) continue;
      const studentName = typeof rawStudent.name === 'string' ? rawStudent.name.trim() : '';
      const section = cleanSection(rawStudent.section);
      if (!studentName || section === null) continue;
      students.push({
        id: cleanId(rawStudent.id, 'student'),
        name: studentName,
        section,
      });
    }

    projects.push({
      id: cleanId(rawProject.id, 'project'),
      name,
      students,
    });
  }

  return {
    version: SCHEMA_VERSION,
    settings: { startTime, intervalMinutes, pdfTitle },
    projects,
  };
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return {
        state: createDefaultState(),
        validSavedData: true,
        hadSavedData: false,
        needsInitialSave: true,
      };
    }
    const normalized = normalizeState(JSON.parse(saved));
    if (!normalized) {
      // Corrupt data is left untouched; the user must choose a recovery action.
      return {
        state: createDefaultState(),
        validSavedData: false,
        hadSavedData: true,
        needsInitialSave: false,
      };
    }
    return { state: normalized, validSavedData: true, hadSavedData: true, needsInitialSave: false };
  } catch {
    return {
      state: createDefaultState(),
      validSavedData: false,
      hadSavedData: true,
      needsInitialSave: false,
    };
  }
}

export function saveState(state) {
  try {
    const normalized = normalizeState(state);
    if (!normalized) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function createBackupJson(state) {
  const normalized = normalizeState(state);
  if (!normalized) throw new Error('The current schedule cannot be backed up.');
  return JSON.stringify(normalized, null, 2);
}

export function parseBackupJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const normalized = normalizeState(parsed);
  if (!normalized) {
    throw new Error('This file is not a valid project schedule backup.');
  }
  return normalized;
}
