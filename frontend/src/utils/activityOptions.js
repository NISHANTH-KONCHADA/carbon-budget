/**
 * activityOptions.js
 * ---------------------------------------------------------------------------
 * Mirrors the backend's emission factor categories so the form can render
 * the right input fields and a live "estimated CO2e" preview without an
 * extra round-trip. The backend remains the source of truth for the
 * actual saved figure — this is presentational only.
 * ---------------------------------------------------------------------------
 */

export const CATEGORY_OPTIONS = [
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'food', label: 'Food' },
  { value: 'waste', label: 'Waste' },
  { value: 'shopping', label: 'Shopping' },
];

export const TYPE_OPTIONS = {
  transport: [
    { value: 'car_petrol', label: 'Petrol car', unit: 'km', factor: 0.192 },
    { value: 'car_diesel', label: 'Diesel car', unit: 'km', factor: 0.171 },
    { value: 'car_electric', label: 'Electric car', unit: 'km', factor: 0.053 },
    { value: 'two_wheeler', label: 'Two-wheeler / motorbike', unit: 'km', factor: 0.103 },
    { value: 'bus', label: 'Bus', unit: 'km', factor: 0.105 },
    { value: 'train', label: 'Train / metro', unit: 'km', factor: 0.041 },
    { value: 'flight_domestic', label: 'Domestic flight', unit: 'km', factor: 0.246 },
    { value: 'flight_international', label: 'International flight', unit: 'km', factor: 0.195 },
    { value: 'bike_walk', label: 'Cycling / walking', unit: 'km', factor: 0 },
  ],
  electricity: [{ value: 'grid_kwh', label: 'Grid electricity', unit: 'kWh', factor: 0.79 }],
  food: [
    { value: 'meat_red', label: 'Red meat meal (beef/lamb)', unit: 'meal', factor: 6.5 },
    { value: 'meat_white', label: 'Poultry / fish meal', unit: 'meal', factor: 2.5 },
    { value: 'vegetarian', label: 'Vegetarian meal', unit: 'meal', factor: 1.0 },
    { value: 'vegan', label: 'Vegan meal', unit: 'meal', factor: 0.7 },
    { value: 'dairy_serving', label: 'Dairy serving', unit: 'serving', factor: 1.0 },
  ],
  waste: [
    { value: 'general_kg', label: 'General / landfill waste', unit: 'kg', factor: 0.45 },
    { value: 'recycled_kg', label: 'Recycled waste', unit: 'kg', factor: 0.05 },
    { value: 'composted_kg', label: 'Composted waste', unit: 'kg', factor: 0.1 },
  ],
  shopping: [
    { value: 'clothing_item', label: 'Clothing item', unit: 'item', factor: 8 },
    { value: 'electronics_item', label: 'Electronics / gadget', unit: 'item', factor: 80 },
    { value: 'general_spend_1000inr', label: 'General shopping (per ₹1000)', unit: '₹1000 spent', factor: 5 },
  ],
};

/** Note: electricity uses the region-aware factor from the backend; 0.79 here
 * (India default) is only a local preview estimate and may differ slightly
 * from the saved figure if the account's region is set to something else. */
export function estimateCo2e(category, type, quantity) {
  const option = TYPE_OPTIONS[category]?.find((t) => t.value === type);
  if (!option || !quantity || quantity < 0) return null;
  return Math.round(option.factor * quantity * 1000) / 1000;
}
