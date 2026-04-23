export interface TruckInput {
  sourceCity: string;
  destinationCity: string;
  capacity: number;
  truckType: string;
}

export interface LoadSuggestion {
  id: string;
  sourceCity: string;
  destinationCity: string;
  loadType: string;
  distance: number;
  estimatedProfit: number;
  matchScore: number;
  isRecommended: boolean;
  reasons: string[];
  weight: string;
  company: string;
  scoreBreakdown: {
    route: number;
    capacity: number;
    profit: number;
    type: number;
  };
}

export interface OptimizationResult {
  emptyDistanceReduced: number;
  fuelSaved: number;
  truckUtilization: number;
  estimatedProfit: number;
}

export const TRUCK_TYPES = [
  'Flatbed',
  'Refrigerated',
  'Tanker',
  'Dry Van',
  'Car Carrier',
  'Container',
  'Tipper',
  'Trailer',
];

export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Nagpur',
  'Indore',
  'Bhopal',
  'Surat',
  'Visakhapatnam',
];

const COMPANIES = [
  'TransIndia Logistics',
  'QuickHaul Express',
  'BlueVista Transport',
  'CargoKing Solutions',
  'RoadMaster Freight',
  'SwiftLoad Carriers',
  'OmniRoute Logistics',
  'FreightLink India',
];

const REASON_TEMPLATES = [
  'Closest route to your return path',
  'High profit margin for this route',
  'Minimum deviation from return route',
  'Load type compatible with your truck',
  'Capacity matches your available space',
  'High-demand corridor with reliable shippers',
  'Optimal fuel-to-revenue ratio',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function getTypeMatch(truckType: string, loadType: string): boolean {
  const compatibility: Record<string, string[]> = {
    'Refrigerated': ['Pharmaceuticals', 'Food & Beverages', 'Agricultural Products'],
    'Tanker':       ['Chemicals', 'Food & Beverages'],
    'Flatbed':      ['Steel & Metal', 'Construction Material', 'Machinery'],
    'Container':    ['Electronics', 'Textiles', 'FMCG', 'Automotive Parts'],
    'Dry Van':      ['Electronics', 'Textiles', 'FMCG', 'Furniture'],
    'Tipper':       ['Construction Material', 'Agricultural Products'],
    'Car Carrier':  ['Automotive Parts'],
    'Trailer':      ['Machinery', 'Steel & Metal', 'Construction Material'],
  };
  return compatibility[truckType]?.includes(loadType) ?? false;
}

const AVAILABLE_LOADS = [
  { from: 'Mumbai',    to: 'Pune',         cargo: 'Electronics',           distance: 150, revenue: 18000 },
  { from: 'Mumbai',    to: 'Nashik',        cargo: 'FMCG',                  distance: 167, revenue: 20000 },
  { from: 'Mumbai',    to: 'Ahmedabad',     cargo: 'Textiles',              distance: 524, revenue: 42000 },
  { from: 'Mumbai',    to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 706, revenue: 62000 },
  { from: 'Mumbai',    to: 'Bangalore',     cargo: 'Automotive Parts',      distance: 981, revenue: 85000 },
  { from: 'Pune',      to: 'Hyderabad',     cargo: 'Electronics',           distance: 560, revenue: 48000 },
  { from: 'Pune',      to: 'Nagpur',        cargo: 'Textiles',              distance: 240, revenue: 18000 },
  { from: 'Pune',      to: 'Ahmedabad',     cargo: 'FMCG',                  distance: 403, revenue: 34000 },
  { from: 'Pune',      to: 'Chennai',       cargo: 'Machinery',             distance: 836, revenue: 72000 },
  { from: 'Delhi',     to: 'Jaipur',        cargo: 'Textiles',              distance: 280, revenue: 22000 },
  { from: 'Delhi',     to: 'Lucknow',       cargo: 'FMCG',                  distance: 555, revenue: 44000 },
  { from: 'Delhi',     to: 'Chandigarh',    cargo: 'Steel & Metal',         distance: 243, revenue: 21000 },
  { from: 'Delhi',     to: 'Ahmedabad',     cargo: 'Automotive Parts',      distance: 934, revenue: 80000 },
  { from: 'Bangalore', to: 'Chennai',       cargo: 'Electronics',           distance: 346, revenue: 30000 },
  { from: 'Bangalore', to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 574, revenue: 50000 },
  { from: 'Bangalore', to: 'Pune',          cargo: 'Machinery',             distance: 836, revenue: 72000 },
  { from: 'Hyderabad', to: 'Chennai',       cargo: 'Automotive Parts',      distance: 626, revenue: 54000 },
  { from: 'Hyderabad', to: 'Nagpur',        cargo: 'Steel & Metal',         distance: 503, revenue: 43000 },
  { from: 'Hyderabad', to: 'Bangalore',     cargo: 'FMCG',                  distance: 574, revenue: 48000 },
  { from: 'Chennai',   to: 'Bangalore',     cargo: 'Electronics',           distance: 346, revenue: 30000 },
  { from: 'Chennai',   to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 626, revenue: 55000 },
  { from: 'Chennai',   to: 'Visakhapatnam', cargo: 'Chemicals',             distance: 793, revenue: 68000 },
  { from: 'Kolkata',   to: 'Bhubaneswar',   cargo: 'Steel & Metal',         distance: 440, revenue: 38000 },
  { from: 'Kolkata',   to: 'Patna',         cargo: 'Agricultural Products', distance: 531, revenue: 44000 },
  { from: 'Ahmedabad', to: 'Mumbai',        cargo: 'Textiles',              distance: 524, revenue: 44000 },
  { from: 'Ahmedabad', to: 'Surat',         cargo: 'Chemicals',             distance: 264, revenue: 22000 },
  { from: 'Nagpur',    to: 'Hyderabad',     cargo: 'Steel & Metal',         distance: 503, revenue: 43000 },
  { from: 'Nagpur',    to: 'Pune',          cargo: 'Construction Material', distance: 240, revenue: 19000 },
  { from: 'Jaipur',    to: 'Delhi',         cargo: 'Textiles',              distance: 280, revenue: 23000 },
  { from: 'Surat',     to: 'Mumbai',        cargo: 'Chemicals',             distance: 284, revenue: 24000 },
];

const REGIONS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'South':       ['Bangalore', 'Chennai', 'Hyderabad', 'Visakhapatnam'],
  'North':       ['Delhi', 'Jaipur', 'Lucknow', 'Chandigarh'],
  'West':        ['Ahmedabad', 'Surat'],
  'East':        ['Kolkata', 'Patna', 'Bhubaneswar'],
};

export function generateLoadSuggestions(input: TruckInput): LoadSuggestion[] {
  const seed = [...input.sourceCity, ...input.destinationCity]
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    + input.capacity * 7;
  const rand = seededRandom(seed);

  // Step 1: Primary matches — loads departing from the truck's arrival city
  let candidates = AVAILABLE_LOADS.filter(l => l.from === input.destinationCity);

  // Step 2: Regional fallback if fewer than 3 primary matches
  if (candidates.length < 3) {
    const regionCities = Object.values(REGIONS).find(cities =>
      cities.includes(input.destinationCity)
    ) ?? [];

    const regional = AVAILABLE_LOADS.filter(
      l =>
        regionCities.includes(l.from) &&
        l.from !== input.destinationCity &&
        l.to !== input.sourceCity,
    );

    const primaryKeys = new Set(candidates.map(l => `${l.from}|${l.to}`));
    candidates = [
      ...candidates,
      ...regional.filter(l => !primaryKeys.has(`${l.from}|${l.to}`)),
    ];
  }

  // Step 3: Score, assign random decorators, build LoadSuggestion objects
  const scored: LoadSuggestion[] = candidates.map((l, i) => {
    const routeScore    = l.to !== input.sourceCity ? 1.0 : 0.4;
    const capacityScore = input.capacity / 100;
    const profitPerKm   = l.revenue / l.distance;
    const profitScore   = Math.min(1, profitPerKm / 25);
    const typeScore     = getTypeMatch(input.truckType, l.cargo) ? 1.0 : 0.7;

    const raw = (0.40 * routeScore)
              + (0.30 * capacityScore)
              + (0.20 * profitScore)
              + (0.10 * typeScore);

    const matchScore = Math.min(99, Math.max(50, Math.round(raw * 100)));

    const weight  = `${5 + Math.floor(rand() * 20)} MT`;
    const company = COMPANIES[Math.floor(rand() * COMPANIES.length)];

    const numReasons = 2 + Math.floor(rand() * 2);
    const reasons: string[] = [];
    const usedReasonIndices = new Set<number>();
    for (let r = 0; r < numReasons; r++) {
      let idx: number;
      do {
        idx = Math.floor(rand() * REASON_TEMPLATES.length);
      } while (usedReasonIndices.has(idx));
      usedReasonIndices.add(idx);
      reasons.push(REASON_TEMPLATES[idx]);
    }

    return {
      id: `load-${i + 1}`,
      sourceCity: l.from,
      destinationCity: l.to,
      loadType: l.cargo,
      distance: l.distance,
      estimatedProfit: l.revenue,
      matchScore,
      isRecommended: false,
      reasons,
      weight,
      company,
      scoreBreakdown: {
        route:    Math.round(routeScore    * 0.40 * 100),
        capacity: Math.round(capacityScore * 0.30 * 100),
        profit:   Math.round(profitScore   * 0.20 * 100),
        type:     Math.round(typeScore     * 0.10 * 100),
      },
    };
  });

  // Step 4: Sort descending, cap at 5
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top5 = scored.slice(0, 5);

  // Step 5: Mark best as recommended
  if (top5.length > 0) {
    top5[0].isRecommended = true;
  }

  return top5;
}

export function calculateOptimization(
  input: TruckInput,
  selectedLoad: LoadSuggestion,
): OptimizationResult {
  const emptyDistanceReduced = Math.min(
    85,
    Math.round(50 + (selectedLoad.distance / 600) * 35)
  );
  const fuelSaved = Math.round(
    selectedLoad.distance * 2.5 + (input.capacity / 100) * 800
  );
  const truckUtilization = Math.min(
    95,
    Math.round(input.capacity * 0.9 + (selectedLoad.matchScore / 100) * 15)
  );
  return {
    emptyDistanceReduced,
    fuelSaved,
    truckUtilization,
    estimatedProfit: selectedLoad.estimatedProfit,
  };
}
