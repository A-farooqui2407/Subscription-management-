const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    draft: 'bg-slate-100 text-slate-800 border-slate-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'past due': 'bg-red-100 text-red-800 border-red-200',
    closed: 'bg-slate-800 text-white border-slate-900',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
  };

  const normalizedStatus = status?.toLowerCase() || 'unknown';
  const appliedClass = styles[normalizedStatus] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${appliedClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
