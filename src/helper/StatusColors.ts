type Status = 'created' | 'in_review' | 'in_transit' | 'completed';

export default function StatusColors(status: Status) {
  const statues: Record<Status, string> = {
    created: 'bg-blue-600 text-white',
    in_review: 'bg-yellow-400 text-title',
    in_transit: 'bg-teal-400 text-white',
    completed: 'bg-slate-300 text-slate-600'
  };

  return statues[status];
}
