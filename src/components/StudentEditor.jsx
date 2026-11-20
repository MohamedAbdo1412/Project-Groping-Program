import { createId } from '../lib/id.js';

export default function StudentEditor({ students, onChange, errors = {} }) {
  function updateStudent(index, patch) {
    onChange(students.map((student, i) => (i === index ? { ...student, ...patch } : student)));
  }

  function addStudent() {
    onChange([...students, { id: createId('student'), name: '', section: '' }]);
  }

  return (
    <div className="student-editor">
      <div className="student-columns">
        <span>Student Full Name</span>
        <span>Section Number</span>
        <span aria-hidden="true" />
      </div>
      {students.map((student, index) => {
        const rowErrors = errors[index] || {};
        return (
          <div className="student-row" key={student.id}>
            <div className="field">
              <input
                type="text"
                dir="rtl"
                placeholder={`Student ${index + 1} name`}
                aria-label={`Student ${index + 1} full name`}
                data-testid={`student-name-${index}`}
                value={student.name}
                onChange={(event) => updateStudent(index, { name: event.target.value })}
              />
              {rowErrors.name && <small className="error">{rowErrors.name}</small>}
            </div>
            <div className="field">
              <input
                type="number"
                min="1"
                max="9999"
                step="1"
                placeholder="Section"
                aria-label={`Student ${index + 1} section number`}
                data-testid={`student-section-${index}`}
                value={student.section}
                onChange={(event) => updateStudent(index, { section: event.target.value })}
              />
              {rowErrors.section && <small className="error">{rowErrors.section}</small>}
            </div>
            <button
              type="button"
              className="button button-small button-quiet"
              onClick={() => onChange(students.filter((_, i) => i !== index))}
              aria-label={`Remove student ${index + 1}`}
            >
              Remove
            </button>
          </div>
        );
      })}
      <button type="button" className="button button-small" onClick={addStudent}>
        + Add Student
      </button>
    </div>
  );
}
