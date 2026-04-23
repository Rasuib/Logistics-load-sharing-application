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
  weight: number;
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

const TRUCK_LOAD_COMPATIBILITY: Record<string, string[]> = {
  'Refrigerated': ['Pharmaceuticals', 'Food & Beverages', 'Agricultural Products'],
  'Tanker':       ['Chemicals', 'Food & Beverages'],
  'Flatbed':      ['Steel & Metal', 'Construction Material', 'Machinery'],
  'Container':    ['Electronics', 'Textiles', 'FMCG', 'Automotive Parts'],
  'Dry Van':      ['Electronics', 'Textiles', 'FMCG', 'Furniture'],
  'Tipper':       ['Construction Material', 'Agricultural Products'],
  'Car Carrier':  ['Automotive Parts'],
  'Trailer':      ['Machinery', 'Steel & Metal', 'Construction Material'],
};

const TRUCK_CAPACITY_MT: Record<string, number> = {
  'Flatbed':      20,
  'Refrigerated': 15,
  'Tanker':       20,
  'Dry Van':      18,
  'Car Carrier':  10,
  'Container':    25,
  'Tipper':       16,
  'Trailer':      22,
};

function getTypeMatch(truckType: string, loadType: string): boolean {
  return TRUCK_LOAD_COMPATIBILITY[truckType]?.includes(loadType) ?? false;
}

// --- SCORING CONSTANTS ---
const SCORING_WEIGHTS = {
  route: 0.4,
  capacity: 0.3,
  profit: 0.2,
  type: 0.1,
};
const PROFITABILITY_BENCHMARK_PER_KM = 40; // A more realistic benchmark
const MAX_SCORE = 99;
const MIN_SCORE = 50;

// --- MOCK DATABASE ---
// Added weight (in tons) and company to the load data. This is crucial.
const AVAILABLE_LOADS = [
  { from: 'Mumbai',    to: 'Pune',         cargo: 'Electronics',           distance: 150, revenue: 18000, weight: 12, company: 'QuickHaul Express' },
  { from: 'Mumbai',    to: 'Nashik',        cargo: 'FMCG',                  distance: 167, revenue: 20000, weight: 15, company: 'TransIndia Logistics' },
  { from: 'Mumbai',    to: 'Ahmedabad',     cargo: 'Textiles',              distance: 524, revenue: 42000, weight: 18, company: 'RoadMaster Freight' },
  { from: 'Mumbai',    to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 706, revenue: 62000, weight: 10, company: 'BlueVista Transport' },
  { from: 'Mumbai',    to: 'Bangalore',     cargo: 'Automotive Parts',      distance: 981, revenue: 85000, weight: 22, company: 'CargoKing Solutions' },
  { from: 'Pune',      to: 'Hyderabad',     cargo: 'Electronics',           distance: 560, revenue: 48000, weight: 14, company: 'OmniRoute Logistics' },
  { from: 'Pune',      to: 'Nagpur',        cargo: 'Textiles',              distance: 240, revenue: 18000, weight: 9, company: 'SwiftLoad Carriers' },
  { from: 'Pune',      to: 'Ahmedabad',     cargo: 'FMCG',                  distance: 403, revenue: 34000, weight: 16, company: 'FreightLink India' },
  { from: 'Pune',      to: 'Chennai',       cargo: 'Machinery',             distance: 836, revenue: 72000, weight: 25, company: 'TransIndia Logistics' },
  { from: 'Delhi',     to: 'Jaipur',        cargo: 'Textiles',              distance: 280, revenue: 22000, weight: 11, company: 'QuickHaul Express' },
  { from: 'Delhi',     to: 'Lucknow',       cargo: 'FMCG',                  distance: 555, revenue: 44000, weight: 17, company: 'RoadMaster Freight' },
  { from: 'Delhi',     to: 'Chandigarh',    cargo: 'Steel & Metal',         distance: 243, revenue: 21000, weight: 20, company: 'BlueVista Transport' },
  { from: 'Delhi',     to: 'Ahmedabad',     cargo: 'Automotive Parts',      distance: 934, revenue: 80000, weight: 21, company: 'CargoKing Solutions' },
  { from: 'Bangalore', to: 'Chennai',       cargo: 'Electronics',           distance: 346, revenue: 30000, weight: 13, company: 'OmniRoute Logistics' },
  { from: 'Bangalore', to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 574, revenue: 50000, weight: 8, company: 'SwiftLoad Carriers' },
  { from: 'Bangalore', to: 'Pune',          cargo: 'Machinery',             distance: 836, revenue: 72000, weight: 24, company: 'FreightLink India' },
  { from: 'Hyderabad', to: 'Chennai',       cargo: 'Automotive Parts',      distance: 626, revenue: 54000, weight: 19, company: 'TransIndia Logistics' },
  { from: 'Hyderabad', to: 'Nagpur',        cargo: 'Steel & Metal',         distance: 503, revenue: 43000, weight: 23, company: 'QuickHaul Express' },
  { from: 'Hyderabad', to: 'Bangalore',     cargo: 'FMCG',                  distance: 574, revenue: 48000, weight: 16, company: 'RoadMaster Freight' },
  { from: 'Chennai',   to: 'Bangalore',     cargo: 'Electronics',           distance: 346, revenue: 30000, weight: 12, company: 'BlueVista Transport' },
  { from: 'Chennai',   to: 'Hyderabad',     cargo: 'Pharmaceuticals',       distance: 626, revenue: 55000, weight: 9, company: 'CargoKing Solutions' },
  { from: 'Chennai',   to: 'Visakhapatnam', cargo: 'Chemicals',             distance: 793, revenue: 68000, weight: 18, company: 'OmniRoute Logistics' },
  { from: 'Kolkata',   to: 'Bhubaneswar',   cargo: 'Steel & Metal',         distance: 440, revenue: 38000, weight: 21, company: 'SwiftLoad Carriers' },
  { from: 'Kolkata',   to: 'Patna',         cargo: 'Agricultural Products', distance: 531, revenue: 44000, weight: 15, company: 'FreightLink India' },
  { from: 'Ahmedabad', to: 'Mumbai',        cargo: 'Textiles',              distance: 524, revenue: 44000, weight: 17, company: 'TransIndia Logistics' },
  { from: 'Ahmedabad', to: 'Surat',         cargo: 'Chemicals',             distance: 264, revenue: 22000, weight: 14, company: 'QuickHaul Express' },
  { from: 'Nagpur',    to: 'Hyderabad',     cargo: 'Steel & Metal',         distance: 503, revenue: 43000, weight: 22, company: 'RoadMaster Freight' },
  { from: 'Nagpur',    to: 'Pune',          cargo: 'Construction Material', distance: 240, revenue: 19000, weight: 20, company: 'BlueVista Transport' },
  { from: 'Jaipur',    to: 'Delhi',         cargo: 'Textiles',              distance: 280, revenue: 23000, weight: 13, company: 'CargoKing Solutions' },
  { from: 'Surat',     to: 'Mumbai',        cargo: 'Chemicals',             distance: 284, revenue: 24000, weight: 16, company: 'OmniRoute Logistics' },
];

const REGIONS: Record<string, string[]> = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'South':       ['Bangalore', 'Chennai', 'Hyderabad', 'Visakhapatnam'],
  'North':       ['Delhi', 'Jaipur', 'Lucknow', 'Chandigarh'],
  'West':        ['Ahmedabad', 'Surat'],
  'East':        ['Kolkata', 'Patna', 'Bhubaneswar'],
};

export function generateLoadSuggestions(input: TruckInput): LoadSuggestion[] {
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
    // --- SCORING LOGIC ---
    const routeScore = l.to !== input.sourceCity ? 1.0 : 0.4; // Penalize loads going straight home

    // **FIXED**: Score based on how well the load's weight fits the truck's capacity.
    // A perfect score is if the load is between 80% and 100% of capacity.
    const truckMaxCapacity = TRUCK_CAPACITY_MT[input.truckType] ?? 20; // Default to 20 MT if type is unknown
    const capacityUtilization = l.weight / truckMaxCapacity;
    let capacityScore = 0;
    if (capacityUtilization > 1) {
      capacityScore = 0; // Overweight
    } else if (capacityUtilization >= 0.8) {
      capacityScore = 1.0; // Optimal
    } else {
      capacityScore = capacityUtilization / 0.8; // Sub-optimal but acceptable
    }

    const profitPerKm = l.revenue / l.distance;
    const profitScore = Math.min(1, profitPerKm / PROFITABILITY_BENCHMARK_PER_KM);
    const typeScore = getTypeMatch(input.truckType, l.cargo) ? 1.0 : 0.0; // Penalize mismatch heavily

    const rawScore = (SCORING_WEIGHTS.route * routeScore)
                   + (SCORING_WEIGHTS.capacity * capacityScore)
                   + (SCORING_WEIGHTS.profit * profitScore)
                   + (SCORING_WEIGHTS.type * typeScore);

    const matchScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(rawScore * 100)));

    // **FIXED**: Generate reasons based on actual scores, not randomly.
    const reasons: string[] = [];
    if (profitScore > 0.8) reasons.push('High profit margin for this route');
    if (routeScore === 1.0) reasons.push('Minimal deviation from return path');
    if (capacityScore > 0.9) reasons.push('Excellent capacity utilization');
    if (typeScore === 1.0) reasons.push('Perfect load type for your truck');
    if (reasons.length === 0) reasons.push('A solid, balanced option');

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
      weight: l.weight,
      company: l.company,
      scoreBreakdown: {
        route:    Math.round(routeScore    * SCORING_WEIGHTS.route * 100),
        capacity: Math.round(capacityScore * SCORING_WEIGHTS.capacity * 100),
        profit:   Math.round(profitScore   * SCORING_WEIGHTS.profit * 100),
        type:     Math.round(typeScore     * SCORING_WEIGHTS.type * 100),
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
  // NOTE FOR REVIEW: This logic is for UI demonstration purposes only.
  // Real-world calculations would require much more data, such as:
  // - The truck's home base to calculate actual empty miles saved.
  // - The truck's specific fuel efficiency (km/L).
  const emptyDistanceReduced = Math.min(
    85,
    Math.round(50 + (selectedLoad.distance / 600) * 35)
  );

  const truckMaxCapacity = TRUCK_CAPACITY_MT[input.truckType] ?? 20;
  // A more realistic placeholder for utilization based on the selected load's weight.
  const truckUtilization = Math.min(
    95,
    Math.round((selectedLoad.weight / truckMaxCapacity) * 100)
  );
  // A more realistic placeholder for fuel saved. The formula is arbitrary.
  const fuelSaved = Math.round(
    selectedLoad.distance * 0.5 + (selectedLoad.weight / truckMaxCapacity) * 800
  );
  return {
    emptyDistanceReduced,
    fuelSaved,
    truckUtilization,
    estimatedProfit: selectedLoad.estimatedProfit,
  };
}
