import { createId } from './id.js';

/** Authoritative data extracted from the supplied PDF. Order is significant. */
export const DEFAULT_SCHEDULE = {
  settings: {
    startTime: '12:00',
    intervalMinutes: 15,
  },
  projects: [
    {
      name: 'Coplanar Waveguide (CPW)',
      students: [
        { name: 'أروى بهاء حسين حسن نصار', section: 1 },
        { name: 'جاسمين احمد عبدالعال محمد', section: 1 },
        { name: 'سارة صلاح فايز امام', section: 2 },
        { name: 'مريم محمد العيوطي محمد', section: 4 },
        { name: 'منة الله خالد عبدالجواد محمد', section: 4 },
        { name: 'ميسون عبدالرحمن السيد علي', section: 4 },
      ],
    },
    {
      name: 'WR-90 90° H-Plane Waveguide Bend',
      students: [
        { name: 'احمد ابراهيم محمد ابراهيم', section: 1 },
        { name: 'باسل عمرو امين فتحي', section: 1 },
        { name: 'محمد عبد الحميد احمد علي', section: 3 },
        { name: 'محمد عبد الرحيم محمد عبد الرحيم', section: 3 },
        { name: 'محمد مصباح محمد مصطفى', section: 3 },
        { name: 'معاذ محمد السيد محمد', section: 4 },
      ],
    },
    {
      name: 'E-Plane Tee',
      students: [
        { name: 'خالد هاني محمد الشحات', section: 1 },
        { name: 'عبد الحي لطفي السيد الجوهري', section: 2 },
        { name: 'عبدالرحمن محمد عبدالجواد', section: 2 },
        { name: 'عمر حسني محمد احمد ابو زيد', section: 2 },
        { name: 'محمود أحمد إبراهيم حسانين', section: 3 },
      ],
    },
    {
      name: 'Microstrip Transmission Line',
      students: [
        { name: 'رنا محمد سعد أحمد', section: 2 },
        { name: 'ساره حسين ابراهيم', section: 2 },
        { name: 'سلمى شريف محمد', section: 2 },
        { name: 'شهد ضياء مختار علي', section: 2 },
        { name: 'صفاء عادل محمود', section: 2 },
        { name: 'فرح أشرف محمد', section: 3 },
        { name: 'نورا سامي عبدالصمد', section: 4 },
      ],
    },
    {
      name: 'Circular Waveguide',
      students: [
        { name: 'ابراهيم خالد سعد محفوظ', section: 1 },
        { name: 'محمد السيد محمد محمود', section: 3 },
      ],
    },
    {
      name: 'Coaxial Cable',
      students: [
        { name: 'عبدالله احمد محمد', section: 2 },
        { name: 'محمد حسن محمد', section: 3 },
        { name: 'محمد عادل حسين', section: 3 },
        { name: 'محمود عبدالله عبيد', section: 3 },
        { name: 'محمود محمد عبداللطيف', section: 4 },
        { name: 'محيي الدين معين', section: 4 },
        { name: 'مروان محمد عناني', section: 4 },
      ],
    },
    {
      name: 'T-Junction',
      students: [
        { name: 'احمد شحاته محمد', section: 1 },
        { name: 'احمد منصور محمد', section: 1 },
        { name: 'احمد وائل شحته', section: 1 },
        { name: 'سامح فريد مختار', section: 2 },
        { name: 'محمد نائل محمد', section: 3 },
        { name: 'محمد صلاح حسيني', section: 3 },
      ],
    },
    {
      name: 'Rectangle Waveguide',
      students: [
        { name: 'احمد سمير فهيم', section: 1 },
        { name: 'احمد محمد عطية', section: 1 },
        { name: 'علي الشوادفي', section: 2 },
        { name: 'عمر السيد محمد', section: 2 },
      ],
    },
    {
      name: 'Magic Tee',
      students: [
        { name: 'عمر عبدالعزيز محمود عبدالعزيز', section: 2 },
        { name: 'عمر عصام فاروق السيد', section: 2 },
        { name: 'فارس هشام محمود حبشي', section: 2 },
        { name: 'محمد عبدالرحمن محمد أحمد', section: 3 },
        { name: 'محمد عبد الفتاح محمد محمود التلباني', section: 3 },
        { name: 'يس احمد السيد العربي', section: 4 },
      ],
    },
    {
      name: 'Coaxial to Waveguide Transition (CWT)',
      students: [
        { name: 'خالد اسامه عبدالسلام', section: 1 },
        { name: 'عمر محمد عبدالعزيز محمد', section: 2 },
        { name: 'محمد احمد محمد نور الدين', section: 3 },
        { name: 'محمد عرفه السيد', section: 3 },
        { name: 'محمود عماد عبدالسميع', section: 3 },
        { name: 'مصطفى علاء محمد', section: 4 },
        { name: 'ندى احمد محمد عبدالكريم', section: 4 },
      ],
    },
    {
      name: 'H-Plane Tee',
      students: [
        { name: 'أحمد عثمان اسماعيل', section: 1 },
        { name: 'اسامة مصطفى محمود', section: 1 },
        { name: 'اسلام سعيد محمود', section: 1 },
        { name: 'محمد عفيفي حسن عفيفي', section: 1 },
        { name: 'ممدوح هشام ممدوح خليل', section: 4 },
        { name: 'يوسف وائل طلعت السيد', section: 4 },
      ],
    },
    {
      name: 'UHF RFID Tag Antenna',
      students: [
        { name: 'عبدالرحمن ميسره ابراهيم محمد', section: 2 },
        { name: 'عمر طلعت محمد احمد', section: 2 },
        { name: 'محمد عبده السيد عطا الله', section: 3 },
        { name: 'محمد عماد جاد أحمد', section: 3 },
        { name: 'يوسف اشرف شعبان السيد', section: 4 },
      ],
    },
    {
      name: 'Rat-Race Hybrid Coupler',
      students: [
        { name: 'محمد هشام محمد محمد', section: 3 },
        { name: 'معاذ رأفت حنفي', section: 4 },
        { name: 'يوسف لبيب كمال', section: 4 },
        { name: 'يوسف محمد حسني', section: 4 },
        { name: 'يوسف محمد رضا', section: 4 },
        { name: 'يوسف محمد عيسي حامد', section: 4 },
        { name: 'يوسف محمود السيد راغب', section: 4 },
      ],
    },
    {
      name: 'Waveguide as a High Pass Filter',
      students: [
        { name: 'احمد حامد عبد الستار', section: 1 },
        { name: 'احمد عبدالعزيز عبد الحميد', section: 1 },
        { name: 'احمد وليد محمود محمد', section: 1 },
        { name: 'انس علي حماد السيد', section: 1 },
        { name: 'باسم علاء السيد', section: 1 },
        { name: 'رويدا هاني محمد', section: 2 },
        { name: 'ياسمين رضا الشبراوي', section: 4 },
      ],
    },
    {
      name: 'Quadrature Coupler 90°',
      students: [
        { name: 'خالد محمد السيد حبيب', section: 1 },
        { name: 'عمر عبد الرحمن عبد الهادي', section: 2 },
        { name: 'عمر عماد حمدي', section: 2 },
        { name: 'محمد عبد الله أبو الفتوح', section: 3 },
        { name: 'محمد فداوي وصفي فداوي', section: 3 },
        { name: 'محمد نبيل محمد علي', section: 3 },
        { name: 'محمود محسن محمود محمود', section: 3 },
      ],
    },
    {
      name: 'Pyramidal Horn Antenna',
      students: [
        { name: 'أحمد حسن محمد الصادق', section: 1 },
        { name: 'أحمد فتحي محمد محمود', section: 1 },
        { name: 'لطفي أسامة محمد', section: 3 },
        { name: 'محمد عبدالسيد', section: 3 },
      ],
    },
    {
      name: 'Wilkinson Power Divider',
      students: [
        { name: 'نور إيهاب محمد مصطفى عفيفي', section: 4 },
        { name: 'مروه ايمن محمد فتحي', section: 4 },
        { name: 'هبة الله محمد عزالدين', section: 4 },
      ],
    },
  ],
};

export const EXPECTED_STUDENT_COUNTS = [6, 6, 5, 7, 2, 7, 6, 4, 6, 7, 6, 5, 7, 7, 7, 4, 3];

/** Adds stable unique IDs without changing names, sections or order. */
export function createDefaultState() {
  return {
    version: 1,
    settings: { ...DEFAULT_SCHEDULE.settings },
    projects: DEFAULT_SCHEDULE.projects.map((project) => ({
      id: createId('project'),
      name: project.name,
      students: project.students.map((student) => ({
        id: createId('student'),
        name: student.name,
        section: student.section,
      })),
    })),
  };
}
