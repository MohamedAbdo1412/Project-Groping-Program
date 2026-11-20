import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import ProjectCard from './ProjectCard.jsx';

export default function ProjectList({ projects, onReorder, onMove, onUpdate, onDelete }) {
  const listRef = useRef(null);
  const reorderRef = useRef(onReorder);
  reorderRef.current = onReorder;

  useEffect(() => {
    const container = listRef.current;
    if (!container) return undefined;

    const sortable = Sortable.create(container, {
      handle: '.drag-handle',
      draggable: '.project-card',
      filter: 'input, textarea, button:not(.drag-handle), select, a',
      animation: 150,
      forceFallback: true,
      fallbackTolerance: 3,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd(event) {
        if (event.oldIndex === event.newIndex || event.oldIndex < 0 || event.newIndex < 0) return;

        // Give DOM control back to React before scheduling the state update.
        const item = event.item;
        const reference =
          event.oldIndex < event.newIndex
            ? event.from.children[event.oldIndex]
            : event.from.children[event.oldIndex + 1];
        event.from.insertBefore(item, reference || null);

        reorderRef.current(event.oldIndex, event.newIndex);
      },
    });

    return () => sortable.destroy();
  }, []);

  return (
    <section className="panel" aria-labelledby="projects-heading">
      <div className="panel-header">
        <h2 id="projects-heading">Projects</h2>
        <p>Drag the handle to reorder. Group numbers and times update automatically.</p>
      </div>
      <div className="project-list" ref={listRef} data-testid="project-list">
        {projects.length === 0 ? (
          <p className="empty-state">No projects yet. Add one above to get started.</p>
        ) : (
          projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              onMove={onMove}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
