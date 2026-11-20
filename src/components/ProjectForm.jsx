import { useEffect, useState } from 'react';
import { createId } from '../lib/id.js';
import StudentEditor from './StudentEditor.jsx';

function blankStudents() {
  return [{ id: createId('student'), name: '', section: '' }];
}

function initialStudents(initialProject) {
  if (!initialProject?.students?.length) return blankStudents();
  return initialProject.students.map((student) => ({ ...student, section: String(student.section) }));
}

export default function ProjectForm({ initialProject, onSubmit, onCancel, submitLabel = 'Add Project' }) {
  const [name, setName] = useState(initialProject?.name ?? '');
  const [students, setStudents] = useState(() => initialStudents(initialProject));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName(initialProject?.name ?? '');
    setStudents(initialStudents(initialProject));
    setErrors({});
  }, [initialProject]);

  function handleSubmit(event) {
    event.preventDefault();
    const projectName = name.trim();
    const nextErrors = {};
    if (!projectName) nextErrors.name = 'Project name is required.';

    const studentErrors = {};
    const cleanedStudents = [];
    students.forEach((student, index) => {
      const studentName = student.name.trim();
      const sectionText = String(student.section ?? '').trim();
      const section = Number(sectionText);
      const rowErrors = {};
      if (!studentName) rowErrors.name = 'Student name is required.';
      if (!sectionText || !Number.isInteger(section) || section < 1 || section > 9999) {
        rowErrors.section = 'Enter a valid section number.';
      }
      if (rowErrors.name || rowErrors.section) studentErrors[index] = rowErrors;
      cleanedStudents.push({
        id: student.id || createId('student'),
        name: studentName,
        section,
      });
    });
    if (cleanedStudents.length === 0) nextErrors.general = 'Add at least one student.';
    if (Object.keys(studentErrors).length) nextErrors.students = studentErrors;

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({ name: projectName, students: cleanedStudents });
    if (!initialProject) {
      setName('');
      setStudents(blankStudents());
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <span>Project Name</span>
        <input
          type="text"
          placeholder="e.g. Coplanar Waveguide (CPW)"
          data-testid="project-name-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <small className="error">{errors.name}</small>}
      </div>

      <div className="students-heading">
        <h3>Students</h3>
        <span>Each student has a name and a section number.</span>
      </div>

      <StudentEditor students={students} onChange={setStudents} errors={errors.students} />
      {errors.general && <small className="error">{errors.general}</small>}

      <div className="form-actions">
        <button type="submit" className="button button-primary" data-testid="submit-project">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="button button-quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
