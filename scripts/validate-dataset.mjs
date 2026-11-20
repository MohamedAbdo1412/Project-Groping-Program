import { createDefaultState, DEFAULT_SCHEDULE, EXPECTED_STUDENT_COUNTS } from '../src/lib/defaultDataset.js';
import { getPresentationTime } from '../src/lib/scheduleUtils.js';

const EXPECTED_TIMES = [
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',
  '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM', '4:00 PM',
];

function check(condition, message) {
  if (!condition) throw new Error('VALIDATION FAILED: ' + message);
}

const projects = DEFAULT_SCHEDULE.projects;
const studentCount = projects.reduce((sum, project) => sum + project.students.length, 0);
const sections = [...new Set(projects.flatMap((project) => project.students.map((student) => student.section)))].sort((a, b) => a - b);
const counts = projects.map((project) => project.students.length);
const times = projects.map((_, index) => getPresentationTime(index, DEFAULT_SCHEDULE.settings));
const seeded = createDefaultState();

check(projects.length === 17, `project count is 17 (got ${projects.length})`);
check(studentCount === 95, `student count is 95 (got ${studentCount})`);
check(JSON.stringify(sections) === JSON.stringify([1, 2, 3, 4]), `section numbers are [1,2,3,4] (got ${JSON.stringify(sections)})`);
check(DEFAULT_SCHEDULE.settings.startTime === '12:00', 'start time is 12:00');
check(DEFAULT_SCHEDULE.settings.intervalMinutes === 15, 'interval is 15 minutes');
check(DEFAULT_SCHEDULE.settings.pdfTitle === 'EMW Project Scheduler', 'default PDF title is EMW Project Scheduler');
check(JSON.stringify(counts) === JSON.stringify(EXPECTED_STUDENT_COUNTS), `per-project counts match (got ${JSON.stringify(counts)})`);
check(JSON.stringify(times) === JSON.stringify(EXPECTED_TIMES), 'all 17 presentation times match the expected schedule');
check(projects.every((project) => project.name.trim() === project.name && project.name.length > 0), 'project names are non-empty and untrimmed');
check(projects.every((project) => project.students.every((student) => Number.isInteger(student.section) && student.name.trim().length > 0)), 'sections are numeric integers and names are non-empty');
check(projects.every((project) => new Set(project.students.map((s) => s.name)).size === project.students.length), 'no duplicate student rows within a project');

const ids = [
  ...seeded.projects.map((project) => project.id),
  ...seeded.projects.flatMap((project) => project.students.map((student) => student.id)),
];
check(new Set(ids).size === ids.length, 'all generated IDs are unique');
check(seeded.projects.length === 17 && seeded.projects[16].name === 'Wilkinson Power Divider', 'seeded state preserves project order');

console.log(JSON.stringify({
  projectCount: projects.length,
  studentCount,
  sectionNumbers: sections,
  startTime: DEFAULT_SCHEDULE.settings.startTime,
  intervalMinutes: DEFAULT_SCHEDULE.settings.intervalMinutes,
  pdfTitle: DEFAULT_SCHEDULE.settings.pdfTitle,
  firstPresentation: times[0],
  lastPresentation: times[times.length - 1],
  studentCounts: counts,
}, null, 2));
console.log('\nDEFAULT DATASET VALIDATION PASSED');
