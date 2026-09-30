import type { UserRole } from '../../lib/types';

export function MeetingsPanel({ role: _role }: { role: UserRole }) {
  return (
    <div className="card p-4">
      <h2 className="section-title mb-3">Upcoming meetings</h2>
      <p className="text-[12px] text-gray-400 leading-relaxed">
        No meetings scheduled. Connect a calendar integration or add events when that module is enabled.
      </p>
    </div>
  );
}
