import { DEFAULT_SETTINGS } from '../lib/scheduleUtils.js';

export default function ScheduleSettings({ settings, onChange }) {
  return (
    <section className="panel" aria-labelledby="settings-heading">
      <div className="panel-header">
        <h2 id="settings-heading">Schedule Settings</h2>
        <p>All presentation times are calculated from these settings.</p>
      </div>
      <div className="settings-grid">
        <label className="field field-wide">
          <span>PDF Title (first page)</span>
          <input
            type="text"
            value={settings.pdfTitle ?? DEFAULT_SETTINGS.pdfTitle}
            placeholder={DEFAULT_SETTINGS.pdfTitle}
            maxLength={120}
            onChange={(event) => onChange({ pdfTitle: event.target.value })}
            data-testid="pdf-title-input"
          />
        </label>
        <label className="field">
          <span>Starting Time</span>
          <input
            type="time"
            value={settings.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Time Interval (minutes)</span>
          <input
            type="number"
            min="1"
            max="1440"
            step="1"
            value={settings.intervalMinutes}
            onChange={(event) => onChange({ intervalMinutes: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}
