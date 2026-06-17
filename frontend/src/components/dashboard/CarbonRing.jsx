import React from 'react';

const CATEGORY_COLORS = {
  transport: '#0F4C42', // primary
  electricity: '#F2A93C', // amber
  food: '#5B7C99', // slate
  waste: '#8C6E4B', // earth brown
  shopping: '#D6502A', // alert/terra
};

const STATUS_LABEL = {
  on_track: 'On track',
  slightly_over: 'Slightly over budget',
  over_budget: 'Over budget',
  well_under: 'Well under budget',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  // Guard against a 0-length arc producing an invalid path.
  if (endAngle - startAngle <= 0.001) return '';
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/**
 * Renders the user's footprint as a ring of category-colored arcs,
 * sized proportionally, sweeping further around the ring the closer
 * (or further past) the user is to their budget. The center shows the
 * total figure and budget status at a glance.
 */
export default function CarbonRing({ breakdown, totalKg, budgetForPeriod, status }) {
  const size = 220;
  const center = size / 2;
  const radius = 88;
  const strokeWidth = 18;

  // The ring sweeps a full 360° when usage reaches/exceeds the budget,
  // otherwise it's scaled down proportionally — like a fuel gauge.
  const fillRatio = budgetForPeriod > 0 ? Math.min(totalKg / budgetForPeriod, 1) : 0;
  const totalSweep = 360 * fillRatio;

  let cursor = 0;
  const arcs = breakdown
    .filter((b) => b.co2eKg > 0 && totalKg > 0)
    .map((b) => {
      const share = b.co2eKg / totalKg;
      const sweep = totalSweep * share;
      const arc = { ...b, start: cursor, end: cursor + sweep, color: CATEGORY_COLORS[b.category] || '#5B7C99' };
      cursor += sweep;
      return arc;
    });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Total footprint ${totalKg.toFixed(1)} kilograms CO2 equivalent, status: ${STATUS_LABEL[status] || status}`}
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#DDE3DC" strokeWidth={strokeWidth} />
        {arcs.map((arc) => (
          <path
            key={arc.category}
            d={describeArc(center, center, radius, arc.start, arc.end)}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
        <text x={center} y={center - 6} textAnchor="middle" className="fill-ink font-mono text-2xl font-medium">
          {totalKg.toFixed(1)}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" className="fill-ink/60 font-body text-xs">
          kg CO2e
        </text>
      </svg>

      <p className="font-display text-sm font-semibold text-ink">{STATUS_LABEL[status] || status}</p>

      {/* Visible legend that doubles as an accessible data table, since
          the ring chart itself can't convey per-category figures to
          screen reader / low-vision users. */}
      <table className="w-full max-w-xs text-sm">
        <caption className="sr-only">Carbon footprint breakdown by category</caption>
        <thead>
          <tr className="sr-only">
            <th scope="col">Category</th>
            <th scope="col">kg CO2e</th>
          </tr>
        </thead>
        <tbody>
          {breakdown
            .filter((b) => b.co2eKg > 0)
            .map((b) => (
              <tr key={b.category} className="border-t border-line">
                <th scope="row" className="flex items-center gap-2 py-1.5 text-left font-normal text-ink/80">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[b.category] || '#5B7C99' }}
                  />
                  {b.label}
                </th>
                <td className="py-1.5 text-right font-mono text-ink/80">{b.co2eKg.toFixed(1)} kg</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
