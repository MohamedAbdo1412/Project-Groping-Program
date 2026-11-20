import { withSchedule } from './scheduleUtils.js';

/*
 * The PDF is drawn directly onto a high-resolution canvas and placed on A4
 * pages. Drawing the table ourselves gives real merged cells, predictable
 * pagination and correct browser-side Arabic shaping (the locally bundled
 * Cairo font is used, so no system font is required).
 */

const FONT = '"Cairo", Arial, sans-serif';
const PAGE_W = 794; // A4 at 96 dpi
const PAGE_H = 1123;
const SCALE = 2;
const MARGIN_X = 38;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 48;
const HEADER_H = 42;
const BASE_ROW_H = 30;
const LINE_H = 18;
const CELL_PAD = 8;
const BODY_FONT_SIZE = 13;

const TABLE_W = PAGE_W - MARGIN_X * 2;
const WIDTHS = {
  time: 144,
  section: 70,
  students: 210,
  project: 240,
  group: 54,
};

const X_TIME = MARGIN_X;
const X_SECTION = X_TIME + WIDTHS.time;
const X_STUDENTS = X_SECTION + WIDTHS.section;
const X_PROJECT = X_STUDENTS + WIDTHS.students;
const X_GROUP = X_PROJECT + WIDTHS.project;
const X_END = X_GROUP + WIDTHS.group;

const HEADERS = [
  { x: X_TIME, w: WIDTHS.time, label: 'الميعاد' },
  { x: X_SECTION, w: WIDTHS.section, label: 'السكشن' },
  { x: X_STUDENTS, w: WIDTHS.students, label: 'الطلاب' },
  { x: X_PROJECT, w: WIDTHS.project, label: 'المشروع' },
  { x: X_GROUP, w: WIDTHS.group, label: 'الجروب' },
];

const ARABIC_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export async function ensurePdfFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`400 16px ${FONT}`, 'المشروع الطلاب السكشن'),
      document.fonts.load(`700 16px ${FONT}`, 'الجروب الميعاد'),
      document.fonts.load(`400 16px ${FONT}`, 'WR-90 90° Project'),
      document.fonts.load(`700 16px ${FONT}`, '12:00 PM'),
    ]);
    await document.fonts.ready;
  } catch {
    // The browser will fall back to a system font; generation still works.
  }
}

function wrapText(ctx, value, maxWidth) {
  const words = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [''];

  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) {
      lines.push(line);
      line = '';
    }
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = '';
    for (const character of Array.from(word)) {
      if (chunk && ctx.measureText(chunk + character).width > maxWidth) {
        lines.push(chunk);
        chunk = '';
      }
      chunk += character;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCellText(ctx, value, x, y, w, h, options = {}) {
  const {
    align = 'center',
    direction = 'ltr',
    bold = false,
    fontSize = BODY_FONT_SIZE,
    lines: presetLines,
    nowrap = false,
    pad = CELL_PAD,
  } = options;

  ctx.save();
  const weight = bold ? '700' : '400';
  ctx.font = `${weight} ${fontSize}px ${FONT}`;
  ctx.direction = direction;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';

  const maxWidth = w - pad * 2;
  const centerY = y + h / 2;
  const textX = align === 'right' ? x + w - pad : align === 'left' ? x + pad : x + w / 2;

  if (nowrap) {
    // Keep each header word on one line: shrink the font, then squeeze only as
    // a last resort instead of splitting the Arabic word across lines.
    let size = fontSize;
    while (ctx.measureText(value).width > maxWidth && size > 9) {
      size -= 1;
      ctx.font = `${weight} ${size}px ${FONT}`;
    }
    ctx.fillText(value, textX, centerY, maxWidth);
    ctx.restore();
    return;
  }

  const lines = presetLines ?? wrapText(ctx, value, maxWidth);
  const firstY = centerY - ((lines.length - 1) * LINE_H) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, firstY + index * LINE_H);
  });
  ctx.restore();
}

function drawHeader(ctx, top) {
  ctx.fillStyle = '#dbe7f4';
  ctx.fillRect(MARGIN_X, top, TABLE_W, HEADER_H);
  for (const column of HEADERS) {
    drawCellText(ctx, column.label, column.x, top, column.w, HEADER_H, {
      bold: true,
      fontSize: 15,
      direction: 'rtl',
      align: 'center',
      nowrap: true,
      pad: 4,
    });
  }
}

function buildBlocks(scheduled, measureCtx) {
  measureCtx.font = `400 ${BODY_FONT_SIZE}px ${FONT}`;
  return scheduled.map((project) => {
    const projectLines = wrapText(measureCtx, project.name, WIDTHS.project - CELL_PAD * 2);
    const studentLines = project.students.map((student) =>
      wrapText(measureCtx, student.name, WIDTHS.students - CELL_PAD * 2),
    );
    const longest = Math.max(1, projectLines.length, ...studentLines.map((lines) => lines.length));
    const rowH = Math.max(BASE_ROW_H, longest * LINE_H + 12);
    return {
      project,
      rowH,
      projectLines,
      studentLines,
      studentCount: Math.max(1, project.students.length),
    };
  });
}

function drawSegment(ctx, block, y, startIndex, rows, segmentHeight) {
  const { project } = block;

  drawCellText(ctx, String(project.groupNumber), X_GROUP, y, WIDTHS.group, segmentHeight, {
    bold: true,
    fontSize: 14,
  });
  drawCellText(ctx, '', X_PROJECT, y, WIDTHS.project, segmentHeight, {
    align: 'center',
    lines: block.projectLines,
  });
  drawCellText(ctx, project.presentationTime, X_TIME, y, WIDTHS.time, segmentHeight, {
    bold: true,
    fontSize: 13,
  });

  for (let offset = 0; offset < rows; offset += 1) {
    const rowY = y + offset * block.rowH;
    const student = project.students[startIndex + offset];
    if (student) {
      const name = String(student.name ?? '');
      drawCellText(ctx, '', X_STUDENTS, rowY, WIDTHS.students, block.rowH, {
        align: 'right',
        direction: ARABIC_PATTERN.test(name) ? 'rtl' : 'ltr',
        lines: block.studentLines[startIndex + offset] ?? [''],
      });
      drawCellText(ctx, String(student.section), X_SECTION, rowY, WIDTHS.section, block.rowH);
    }
  }
}

function drawGrid(page) {
  const { ctx } = page;
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  for (const x of [X_TIME, X_SECTION, X_STUDENTS, X_PROJECT, X_GROUP, X_END]) {
    ctx.beginPath();
    ctx.moveTo(x, MARGIN_TOP);
    ctx.lineTo(x, page.bottom);
    ctx.stroke();
  }
  for (const y of page.fullYs) {
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, y);
    ctx.lineTo(X_END, y);
    ctx.stroke();
  }
  for (const y of page.innerYs) {
    ctx.beginPath();
    ctx.moveTo(X_SECTION, y);
    ctx.lineTo(X_PROJECT, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Returns an array of canvases, one per PDF page. */
export function renderSchedulePages(projects, settings) {
  const scheduled = withSchedule(projects, settings);
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  const blocks = buildBlocks(scheduled, measureCtx);

  const pages = [];
  let page = null;
  let y = 0;

  function newPage() {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W * SCALE;
    canvas.height = PAGE_H * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.textBaseline = 'middle';

    page = {
      canvas,
      ctx,
      fullYs: [MARGIN_TOP, MARGIN_TOP + HEADER_H],
      innerYs: [],
      bottom: MARGIN_TOP + HEADER_H,
    };
    pages.push(page);
    drawHeader(ctx, MARGIN_TOP);
    y = MARGIN_TOP + HEADER_H;
  }

  function moveToNextPage() {
    drawGrid(page);
    newPage();
  }

  newPage();
  const bodyTop = MARGIN_TOP + HEADER_H;
  const bodyBottom = PAGE_H - MARGIN_BOTTOM;
  const bodyHeight = bodyBottom - bodyTop;

  for (const block of blocks) {
    // A project is one indivisible block: never split its students across
    // pages. If it does not fit in the remaining space, start a new page.
    let blockHeight = block.studentCount * block.rowH;
    if (blockHeight > bodyHeight) {
      block.rowH = Math.max(18, Math.floor(bodyHeight / block.studentCount));
      blockHeight = block.studentCount * block.rowH;
    }
    if (y > bodyTop && y + blockHeight > bodyBottom) {
      moveToNextPage();
    }

    drawSegment(page.ctx, block, y, 0, block.studentCount, blockHeight);
    for (let offset = 0; offset < block.studentCount - 1; offset += 1) {
      page.innerYs.push(y + (offset + 1) * block.rowH);
    }
    y += blockHeight;
    page.bottom = y;
    page.fullYs.push(y);
  }

  drawGrid(page);
  return pages.map((item) => item.canvas);
}

export async function exportSchedulePdf(projects, settings, filename = 'Project-Schedule.pdf') {
  await ensurePdfFonts();
  const canvases = renderSchedulePages(projects, settings);

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  canvases.forEach((canvas, index) => {
    if (index > 0) doc.addPage();
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  });
  doc.save(filename);
  return canvases.length;
}
