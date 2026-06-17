import React from 'react';
import { SEVERITY_STYLES } from '../../utils/co2Format';

export default function RecommendationCard({ recommendation }) {
  const style = SEVERITY_STYLES[recommendation.severity] || SEVERITY_STYLES.info;

  return (
    <li className="flex gap-3 rounded-card border border-line bg-white p-4">
      <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${style.dot}`} />
      <div>
        <p className="font-display text-sm font-semibold text-ink">{recommendation.title}</p>
        <p className="mt-1 text-sm text-ink/70">{recommendation.tip}</p>
      </div>
    </li>
  );
}
