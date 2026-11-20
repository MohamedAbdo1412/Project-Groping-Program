# Project Scheduler

A local, backend-free React app for managing university presentation groups, their students and sections, ordering presentations, and exporting a printable RTL schedule PDF.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Production build / local preview:

```bash
npm run build
npm run preview
```

## Features

- Add, edit and delete projects with any number of students (name + section).
- Drag project cards with the dedicated handle (SortableJS), or use Move Up / Move Down.
- Group numbers and presentation times are derived from project order; starting time and interval are editable.
- Automatic persistence in LocalStorage under `project-scheduler:v1`, with JSON backup/restore.
- First launch seeds the complete 17-project / 95-student dataset from the reference PDF. A confirmed "Restore Original PDF Dataset" action is available, and corrupt storage is reported rather than silently replaced.
- A4 PDF export with RTL table, merged cells, repeated header, pagination, and a locally bundled Cairo font.

Validate the built-in dataset with:

```bash
npm run validate:data
```

No backend, database, login, external API, or network connection is required at runtime.
