<div align="center">

<img src="public/favicon.svg" alt="Project Scheduler" width="78" />

# Project Scheduler

### Arrange presentation groups, calculate times automatically, and export a print-ready RTL schedule PDF.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![SortableJS](https://img.shields.io/badge/SortableJS-drag%20%26%20drop-1a9fbe)
![jsPDF](https://img.shields.io/badge/PDF-jsPDF-ff6b4a)
![Offline ready](https://img.shields.io/badge/offline-ready-16a34a)
![No backend](https://img.shields.io/badge/backend-none-6b7280)

</div>

---

## ✨ What it does

This is a small, focused tool for managing university project presentations. There is no server, no login and no database — everything runs in the browser and is saved locally.

| Area | What you get |
| --- | --- |
| **Schedule settings** | Editable start time (default `12:00`), interval (default `15 min`), and PDF title (default `EMW Project Scheduler`). Times recalculate instantly. |
| **Projects & students** | Add, edit and delete projects; add, edit and remove students with section numbers. |
| **Ordering** | Drag project cards with a dedicated handle (SortableJS), or use the accessible Move Up / Move Down buttons. |
| **Persistence** | Automatic LocalStorage saving under `project-scheduler:v1`, plus JSON backup / restore. |
| **PDF export** | A4 portrait table with RTL columns, Arabic headings, vertically merged cells, repeated header and clean pagination. |
| **Built-in dataset** | Ships with the complete reference schedule: **17 projects / 95 students / sections 1–4**. |

---

## 🚀 Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

For a production build:

```bash
npm run build
npm run preview
```

Runtime requirements: a modern browser and Node.js 20.19+ for development. No internet connection is needed after dependencies are installed.

---

## 🧠 How the schedule works

The project array is the **single source of truth**. Group numbers and presentation times are never stored — they are derived from the current order:

```js
presentationTime = startTime + (projectIndex × intervalMinutes)
```

```js
{
  settings: { startTime: '12:00', intervalMinutes: 15 },
  projects: [
    {
      id: 'project-uuid',
      name: 'Coplanar Waveguide (CPW)',
      students: [
        { id: 'student-uuid', name: 'أروى بهاء حسين حسن نصار', section: 1 },
      ],
    },
  ],
}
```

| Group | Time | Group | Time |
| ---: | --- | ---: | --- |
| 1 | 12:00 PM | 10 | 2:15 PM |
| 2 | 12:15 PM | 11 | 2:30 PM |
| 3 | 12:30 PM | 12 | 2:45 PM |
| 4 | 12:45 PM | 13 | 3:00 PM |
| 5 | 1:00 PM | 14 | 3:15 PM |
| 6 | 1:15 PM | 15 | 3:30 PM |
| 7 | 1:30 PM | 16 | 3:45 PM |
| 8 | 1:45 PM | 17 | 4:00 PM |
| 9 | 2:00 PM | | |

---

## 📄 PDF output

The export is a real schedule table — not a stack of cards. From right to left:

| الميعاد | السكشن | الطلاب | المشروع | الجروب |
| --- | --- | --- | --- | --- |
| 12:00 PM | 1 | Student A | Project A | 1 |
| | 2 | Student B | | |
| | 4 | Student C | | |

- A bold title (default `EMW Project Scheduler`, editable in Schedule Settings) is printed at the top of the first page only.
- Group, project and time cells are vertically merged per project, with thick cell borders and a white margin between projects.
- A project block is never split across pages; it moves whole to the next page.
- Arabic text is shaped with a locally bundled **Cairo** font and stays connected.
- Section numbers, group numbers and times are drawn left-to-right so they never reverse.

---

## 🗂 Project structure

```text
src/
├── App.jsx                     # State, actions, backup/restore, PDF trigger
├── components/
│   ├── ScheduleSettings.jsx
│   ├── ProjectForm.jsx
│   ├── ProjectList.jsx         # SortableJS integration
│   ├── ProjectCard.jsx
│   └── StudentEditor.jsx
├── lib/
│   ├── defaultDataset.js       # Authoritative 17-project dataset
│   ├── storage.js              # Versioned load/save + validation
│   ├── scheduleUtils.js        # Time arithmetic and derived values
│   ├── pdfExport.js            # RTL table rendering and pagination
│   └── id.js
└── styles.css
public/
├── favicon.svg
└── fonts/                      # Local Cairo Arabic + Latin subsets
scripts/
└── validate-dataset.mjs
```

---

## ✅ Built-in data validation

```bash
npm run validate:data
```

Expected result:

```text
projectCount:      17
studentCount:      95
sectionNumbers:    [1, 2, 3, 4]
startTime:         "12:00"
intervalMinutes:   15
firstPresentation: "12:00 PM"
lastPresentation:  "4:00 PM"
```

The validator also checks every per-project student count, all 17 times, unique IDs, numeric sections and duplicate rows.

---

## 🔐 Data safety

- Data is saved automatically after every change; a fresh install is seeded and saved once on first launch.
- Existing schedules are never overwritten by seeding.
- **Restore Original PDF Dataset** reloads the built-in dataset after confirmation.
- Corrupt storage is reported in the UI and left untouched until you choose an explicit recovery action.
- JSON **Backup** / **Restore** lets you move your schedule between browsers or machines.

---

<div align="center">

Built with React + Vite. No backend. No tracking. No external APIs.

</div>
