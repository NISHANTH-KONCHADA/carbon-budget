/**
 * co2Format.js
 * ---------------------------------------------------------------------------
 * Small presentation helpers: consistent number formatting, and "relatable
 * equivalents" that turn an abstract kg CO2e figure into something a person
 * can picture. Equivalents are intentionally rough (clearly labelled "≈")
 * and meant for intuition-building, not precision.
 * ---------------------------------------------------------------------------
 */

export function formatKg(kg) {
  if (kg === null || kg === undefined || Number.isNaN(kg)) return '—';
  return `${kg.toFixed(kg < 10 ? 2 : 1)} kg`;
}

const TREE_ABSORPTION_KG_PER_MONTH = 21 / 12; // ~21kg CO2/year per mature tree, rough estimate
const KM_PER_KG_PETROL_CAR = 1 / 0.192;

export function getEquivalents(totalKg) {
  if (!totalKg || totalKg <= 0) return [];
  return [
    {
      id: 'tree_months',
      value: Math.round(totalKg / TREE_ABSORPTION_KG_PER_MONTH),
      label: (v) => `≈ ${v} month${v === 1 ? '' : 's'} of CO2 absorbed by one mature tree`,
    },
    {
      id: 'km_driven',
      value: Math.round(totalKg * KM_PER_KG_PETROL_CAR),
      label: (v) => `≈ ${v.toLocaleString()} km driven in a petrol car`,
    },
  ];
}

export const SEVERITY_STYLES = {
  high: { dot: 'bg-alert', text: 'text-alert' },
  medium: { dot: 'bg-amber-dark', text: 'text-amber-dark' },
  low: { dot: 'bg-slate', text: 'text-slate' },
  positive: { dot: 'bg-primary', text: 'text-primary' },
  info: { dot: 'bg-slate', text: 'text-slate' },
};
