import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectForm from './components/ProjectForm.jsx';
import ProjectList from './components/ProjectList.jsx';
import ScheduleSettings from './components/ScheduleSettings.jsx';
import { createDefaultState } from './lib/defaultDataset.js';
import { createId } from './lib/id.js';
import { exportSchedulePdf } from './lib/pdfExport.js';
import { withSchedule } from './lib/scheduleUtils.js';
import { createBackupJson, loadState, parseBackupJson, saveState } from './lib/storage.js';

export default function App() {
  const [initial] = useState(() => loadState());
  const [state, setState] = useState(initial.state);
  const [touched, setTouched] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  // Seed a fresh installation once and save it immediately. Existing valid
  // data is never replaced; corrupt data is left untouched until the user
  // explicitly chooses a recovery action.
  useEffect(() => {
    if (touched || initial.needsInitialSave) saveState(state);
  }, [state, touched, initial.needsInitialSave]);

  const scheduledProjects = useMemo(
    () => withSchedule(state.projects, state.settings),
    [state.projects, state.settings],
  );

  function modify(updater) {
    setState(updater);
    setTouched(true);
    setNotice('');
  }

  function handleSettingsChange(patch) {
    modify((previous) => {
      const settings = { ...previous.settings, ...patch };
      if (patch.intervalMinutes !== undefined) {
        const text = String(patch.intervalMinutes).trim();
        settings.intervalMinutes = /^\d+$/.test(text) && Number(text) >= 1 ? Number(text) : text;
      }
      return { ...previous, settings };
    });
  }

  function handleAddProject(data) {
    modify((previous) => ({
      ...previous,
      projects: [
        ...previous.projects,
        {
          id: createId('project'),
          name: data.name.trim(),
          students: data.students.map((student) => ({
            id: student.id || createId('student'),
            name: student.name.trim(),
            section: student.section,
          })),
        },
      ],
    }));
  }

  function handleUpdateProject(id, data) {
    modify((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              name: data.name.trim(),
              students: data.students.map((student) => ({
                id: student.id || createId('student'),
                name: student.name.trim(),
                section: student.section,
              })),
            }
          : project,
      ),
    }));
  }

  function handleDeleteProject(id) {
    modify((previous) => ({
      ...previous,
      projects: previous.projects.filter((project) => project.id !== id),
    }));
  }

  function handleReorder(from, to) {
    modify((previous) => {
      const projects = [...previous.projects];
      const [moved] = projects.splice(from, 1);
      projects.splice(to, 0, moved);
      return { ...previous, projects };
    });
  }

  function handleMove(id, direction) {
    const from = state.projects.findIndex((project) => project.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= state.projects.length) return;
    handleReorder(from, to);
  }

  function handleRestoreDataset() {
    const confirmed = window.confirm(
      'Replace the current schedule with the original 17-project PDF dataset? This overwrites all current projects and students.',
    );
    if (!confirmed) return;
    setState(createDefaultState());
    setTouched(true);
    setNotice('Original PDF dataset restored.');
  }

  function handleBackup() {
    try {
      const blob = new Blob([createBackupJson(state)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Project-Schedule-backup.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setNotice('Backup downloaded.');
    } catch (error) {
      window.alert(`Backup failed: ${error.message}`);
    }
  }

  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const restored = parseBackupJson(await file.text());
      const confirmed = window.confirm(
        `Replace the current schedule (${state.projects.length} project${state.projects.length === 1 ? '' : 's'}) with this backup?`,
      );
      if (!confirmed) return;
      setState(restored);
      setTouched(true);
      setNotice('Schedule restored from backup.');
    } catch (error) {
      window.alert(`Restore failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportSchedulePdf(state.projects, state.settings);
      setNotice('PDF downloaded.');
    } catch (error) {
      window.alert(`PDF export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Project Scheduler</h1>
          <p className="subtitle" dir="rtl" lang="ar">
            جدول العروض التقديمية للمشروعات
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={handleExportPdf}
            disabled={exporting}
            data-testid="export-pdf"
          >
            {exporting ? 'Generating…' : 'Export PDF'}
          </button>
          <button type="button" className="button" onClick={handleBackup}>
            Backup
          </button>
          <button type="button" className="button" onClick={() => fileInputRef.current?.click()}>
            Restore
          </button>
          <button
            type="button"
            className="button"
            onClick={handleRestoreDataset}
            data-testid="restore-dataset"
          >
            Restore Original PDF Dataset
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={handleRestoreFile}
            data-testid="restore-file"
          />
        </div>
      </header>

      {!initial.validSavedData && (
        <div className="notice notice-warning" role="alert" data-testid="corrupt-data-notice">
          <span>
            Saved schedule could not be read. Existing saved data was not deleted. Choose a recovery
            option:
          </span>
          <button type="button" className="button button-small" onClick={handleRestoreDataset}>
            Restore Original PDF Dataset
          </button>
          <button
            type="button"
            className="button button-small"
            onClick={() => fileInputRef.current?.click()}
          >
            Restore from JSON Backup
          </button>
        </div>
      )}

      {notice && (
        <p className="notice" role="status" data-testid="notice">
          {notice}
        </p>
      )}

      <main className="app-content">
        <ScheduleSettings settings={state.settings} onChange={handleSettingsChange} />

        <section className="panel" aria-labelledby="add-project-heading">
          <div className="panel-header">
            <h2 id="add-project-heading">Add Project</h2>
            <p>Create one presentation group with its students.</p>
          </div>
          <ProjectForm onSubmit={handleAddProject} />
        </section>

        <ProjectList
          projects={scheduledProjects}
          onReorder={handleReorder}
          onMove={handleMove}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      </main>

      <footer className="app-footer">
        Data is saved automatically in this browser. Use Backup / Restore to protect it.
      </footer>
    </div>
  );
}
