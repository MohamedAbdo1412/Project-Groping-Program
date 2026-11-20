import { useState } from 'react';
import ProjectForm from './ProjectForm.jsx';

export default function ProjectCard({ project, index, total, onMove, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  function handleDelete() {
    if (window.confirm(`Delete "${project.name}" and all of its students?`)) {
      onDelete(project.id);
    }
  }

  return (
    <article className="project-card" data-project-id={project.id} data-testid="project-card">
      <div className="project-card-body">
        <button
          type="button"
          className="drag-handle"
          title="Drag to reorder"
          aria-label={`Drag handle for ${project.name}`}
          data-testid="drag-handle"
        >
          <span aria-hidden="true">⠿</span>
        </button>

        <div className="project-details">
          <div className="project-title-row">
            <span className="group-badge" data-testid="group-number">
              Group {project.groupNumber}
            </span>
            <h3 className="project-name">{project.name}</h3>
          </div>
          <div className="project-meta">
            <strong data-testid="presentation-time">{project.presentationTime}</strong>
            <span>
              {project.students.length} {project.students.length === 1 ? 'student' : 'students'}
            </span>
          </div>
          <ul className="student-list">
            {project.students.map((student) => (
              <li key={student.id} dir="rtl">
                <span dir="rtl">{student.name}</span>
                <span className="student-dash" aria-hidden="true"> — </span>
                <span className="section-pill" dir="ltr">Section {student.section}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="button button-small button-quiet"
            onClick={() => onMove(project.id, -1)}
            disabled={index === 0}
            aria-label={`Move ${project.name} up`}
            data-testid="move-up"
          >
            ↑ Up
          </button>
          <button
            type="button"
            className="button button-small button-quiet"
            onClick={() => onMove(project.id, 1)}
            disabled={index === total - 1}
            aria-label={`Move ${project.name} down`}
            data-testid="move-down"
          >
            ↓ Down
          </button>
          <button
            type="button"
            className="button button-small"
            onClick={() => setEditing((value) => !value)}
            data-testid="edit-project"
          >
            {editing ? 'Close' : 'Edit'}
          </button>
          <button
            type="button"
            className="button button-small button-danger"
            onClick={handleDelete}
            data-testid="delete-project"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="card-editor">
          <ProjectForm
            initialProject={project}
            submitLabel="Save Project"
            onCancel={() => setEditing(false)}
            onSubmit={(data) => {
              onUpdate(project.id, data);
              setEditing(false);
            }}
          />
        </div>
      )}
    </article>
  );
}
