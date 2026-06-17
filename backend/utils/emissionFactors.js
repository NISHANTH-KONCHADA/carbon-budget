/**
 * emissionFactors.js
 * ---------------------------------------------------------------------------
 * Reference emission factors used to convert everyday activities into
 * kilograms of CO2-equivalent (kg CO2e).
 *
 * IMPORTANT — these are illustrative, simplified figures intended for
 * personal awareness and education, not certified carbon accounting.
 * They are ballparked from widely published, public reference points
 * (UK DEFRA/BEIS conversion factors, US EPA GHG equivalencies, IPCC AR6
 * lifecycle estimates, and India's Central Electricity Authority (CEA)
 * grid emission factor). Real-world figures vary by country, vehicle
 * efficiency, grid mix, and supply chain — this app is meant to build
 * intuition and habits, not to replace a verified carbon audit.
 * ---------------------------------------------------------------------------
 */

// kg CO2e per passenger-km (or per km for personal vehicles)
const TRANSPORT = {
  car_petrol: { factor: 0.192, unit: 'km', label: 'Petrol car' },
  car_diesel: { factor: 0.171, unit: 'km', label: 'Diesel car' },
  car_electric: { factor: 0.053, unit: 'km', label: 'Electric car' },
  two_wheeler: { factor: 0.103, unit: 'km', label: 'Two-wheeler / motorbike' },
  bus: { factor: 0.105, unit: 'km', label: 'Bus' },
  train: { factor: 0.041, unit: 'km', label: 'Train / metro' },
  flight_domestic: { factor: 0.246, unit: 'km', label: 'Domestic flight' },
  flight_international: { factor: 0.195, unit: 'km', label: 'International flight' },
  bike_walk: { factor: 0, unit: 'km', label: 'Cycling / walking' },
};

// kg CO2e per kWh of grid electricity, by region (approximate grid mix)
const ELECTRICITY_REGION_FACTOR = {
  IN: 0.79, // India (CEA grid average, approx.)
  US: 0.42,
  EU: 0.28,
  GLOBAL: 0.48,
};

const ELECTRICITY = {
  grid_kwh: { unit: 'kWh', label: 'Grid electricity' },
};

// kg CO2e per meal / serving (lifecycle average, simplified)
const FOOD = {
  meat_red: { factor: 6.5, unit: 'meal', label: 'Red meat meal (beef/lamb)' },
  meat_white: { factor: 2.5, unit: 'meal', label: 'Poultry / fish meal' },
  vegetarian: { factor: 1.0, unit: 'meal', label: 'Vegetarian meal' },
  vegan: { factor: 0.7, unit: 'meal', label: 'Vegan meal' },
  dairy_serving: { factor: 1.0, unit: 'serving', label: 'Dairy serving' },
};

// kg CO2e per kg of waste
const WASTE = {
  general_kg: { factor: 0.45, unit: 'kg', label: 'General / landfill waste' },
  recycled_kg: { factor: 0.05, unit: 'kg', label: 'Recycled waste' },
  composted_kg: { factor: 0.1, unit: 'kg', label: 'Composted waste' },
};

// Rough lifecycle proxies for consumption — intentionally conservative,
// flagged in the UI as a "rough indicator" rather than a precise figure.
const SHOPPING = {
  clothing_item: { factor: 8, unit: 'item', label: 'Clothing item' },
  electronics_item: { factor: 80, unit: 'item', label: 'Electronics / gadget' },
  general_spend_1000inr: { factor: 5, unit: '₹1000 spent', label: 'General shopping (per ₹1000)' },
};

const CATEGORIES = {
  transport: TRANSPORT,
  electricity: ELECTRICITY,
  food: FOOD,
  waste: WASTE,
  shopping: SHOPPING,
};

const CATEGORY_LABELS = {
  transport: 'Transport',
  electricity: 'Electricity',
  food: 'Food',
  waste: 'Waste',
  shopping: 'Shopping',
};

// A rough "fair share" daily personal carbon budget used as the default
// target, based on the widely cited ~2-tonne/year 2050 climate-aligned
// per-capita target (2000 kg / 365 days ≈ 5.5 kg/day). Users can adjust this.
const DEFAULT_DAILY_BUDGET_KG = 5.5;

module.exports = {
  TRANSPORT,
  ELECTRICITY,
  ELECTRICITY_REGION_FACTOR,
  FOOD,
  WASTE,
  SHOPPING,
  CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_DAILY_BUDGET_KG,
};
