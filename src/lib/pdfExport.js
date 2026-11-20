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
const TITLE_H = 38; // space reserved above the table on page 1 only
const TITLE_FONT_SIZE = 22;
const PROJECT_GAP = 0; // white margin between consecutive project blocks
const CELL_BORDER_W = 2;
const OUTER_BORDER_W = 3;
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

function drawTitle(ctx, title) {
  const text = typeof title === 'string' ? title.trim() : '';
  if (!text) return;

  ctx.save();
  ctx.fillStyle = '#1e3a8a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = ARABIC_PATTERN.test(text) ? 'rtl' : 'ltr';

  let size = TITLE_FONT_SIZE;
  ctx.font = `700 ${size}px ${FONT}`;
  while (ctx.measureText(text).width > TABLE_W - 24 && size > 12) {
    size -= 1;
    ctx.font = `700 ${size}px ${FONT}`;
  }
  ctx.fillText(text, PAGE_W / 2, MARGIN_TOP + TITLE_H / 2, TABLE_W - 24);
  ctx.restore();
}

function buildBlocks(scheduled, measureCtx) {
  return scheduled.map((project) => {
    measureCtx.font = `700 ${BODY_FONT_SIZE}px ${FONT}`;
    const projectLines = wrapText(measureCtx, project.name, WIDTHS.project - CELL_PAD * 2);
    measureCtx.font = `400 ${BODY_FONT_SIZE}px ${FONT}`;
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
    bold: true,
    lines: block.projectLines,
    fontSize: 14,
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
        bold: true,
        direction: ARABIC_PATTERN.test(name) ? 'rtl' : 'ltr',
        lines: block.studentLines[startIndex + offset] ?? [''],
      });
      drawCellText(ctx, String(student.section), X_SECTION, rowY, WIDTHS.section, block.rowH , {bold: true});
    }
  }
}

function drawGrid(page) {
  const { ctx } = page;
  const columns = [X_TIME, X_SECTION, X_STUDENTS, X_PROJECT, X_GROUP, X_END];
  const line = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.setLineDash([]);

  ctx.lineWidth = CELL_BORDER_W;
  for (const x of columns) line(x, page.tableTop, x, page.headerBottom);
  line(MARGIN_X, page.headerBottom, X_END, page.headerBottom);

  // Vertical separators are drawn per project block so the white margin
  // between projects stays clear instead of being crossed by grid lines.
  for (const segment of page.segments) {
    for (const x of columns) line(x, segment.top, x, segment.bottom);
    line(MARGIN_X, segment.bottom, X_END, segment.bottom);
    for (const y of segment.innerYs) line(X_SECTION, y, X_PROJECT, y);
  }

  // Outer frame last so the corners and thick border stay crisp.
  ctx.lineWidth = OUTER_BORDER_W;
  ctx.strokeRect(MARGIN_X, page.tableTop, TABLE_W, page.bottom - page.tableTop);
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

  function newPage(isFirst) {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W * SCALE;
    canvas.height = PAGE_H * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.textBaseline = 'middle';

    // The title sits above the table on page 1 only; other pages keep the
    // original top margin and repeated header.
    const tableTop = MARGIN_TOP + (isFirst ? TITLE_H : 0);
    const headerBottom = tableTop + HEADER_H;
    page = {
      canvas,
      ctx,
      tableTop,
      headerBottom,
      bodyTop: headerBottom,
      segments: [],
      bottom: headerBottom,
    };
    pages.push(page);
    if (isFirst) drawTitle(ctx, settings.pdfTitle);
    drawHeader(ctx, tableTop);
    y = headerBottom;
  }

  function moveToNextPage() {
    drawGrid(page);
    newPage(false);
  }

  newPage(true);
  const bodyBottom = PAGE_H - MARGIN_BOTTOM;
  const firstBodyTop = MARGIN_TOP + TITLE_H + HEADER_H;
  const maxBlockHeight = bodyBottom - firstBodyTop - PROJECT_GAP;

  for (const block of blocks) {
    // A project is one indivisible block: never split its students across
    // pages. If it does not fit in the remaining space, start a new page.
    let blockHeight = block.studentCount * block.rowH;
    if (blockHeight > maxBlockHeight) {
      block.rowH = Math.max(16, Math.floor(maxBlockHeight / block.studentCount));
      blockHeight = block.studentCount * block.rowH;
    }
    const gapBefore = y > page.bodyTop ? PROJECT_GAP : 0;
    if (y + gapBefore + blockHeight > bodyBottom) {
      moveToNextPage();
    }
    if (y > page.bodyTop) y += PROJECT_GAP;

    const segment = { top: y, bottom: y + blockHeight, innerYs: [] };
    page.segments.push(segment);
    drawSegment(page.ctx, block, y, 0, block.studentCount, blockHeight);
    for (let offset = 0; offset < block.studentCount - 1; offset += 1) {
      segment.innerYs.push(y + (offset + 1) * block.rowH);
    }
    y += blockHeight;
    page.bottom = y;
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
