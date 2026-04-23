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

const LOAD_TYPES = [
  'Electronics',
  'Furniture',
  'Textiles',
  'Automotive Parts',
  'Pharmaceuticals',
  'Agricultural Products',
  'Construction Material',
  'FMCG',
  'Steel & Metal',
  'Chemicals',
  'Food & Beverages',
  'Machinery',
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

export function generateLoadSuggestions(input: TruckInput): LoadSuggestion[] {
  const seed = [...input.sourceCity, ...input.destinationCity]
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    + input.capacity * 7;
  const rand = seededRandom(seed);

  const returnLoads: LoadSuggestion[] = [];
  const numSuggestions = 4 + Math.floor(rand() * 2);

  const usedDestinations = new Set<string>();
  usedDestinations.add(input.destinationCity);

  for (let i = 0; i < numSuggestions; i++) {
    let destCity: string;
    do {
      destCity = CITIES[Math.floor(rand() * CITIES.length)];
    } while (usedDestinations.has(destCity));
    usedDestinations.add(destCity);

    const distance = 80 + Math.floor(rand() * 600);
    const baseProfit = Math.floor(distance * (8 + rand() * 12));
    const loadType = LOAD_TYPES[Math.floor(rand() * LOAD_TYPES.length)];
    const company = COMPANIES[Math.floor(rand() * COMPANIES.length)];

    const routeScore    = (destCity !== input.sourceCity) ? 1.0 : 0.4;
    const capacityScore = input.capacity / 100;
    const profitPerKm   = baseProfit / distance;
    const profitScore   = Math.min(1, profitPerKm / 25);
    const typeScore     = getTypeMatch(input.truckType, loadType) ? 1.0 : 0.7;

    const raw = (0.40 * routeScore)
              + (0.30 * capacityScore)
              + (0.20 * profitScore)
              + (0.10 * typeScore);

    const matchScore = Math.min(99, Math.max(50, Math.round(raw * 100)));

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

    returnLoads.push({
      id: `load-${i + 1}`,
      sourceCity: input.destinationCity,
      destinationCity: destCity,
      loadType,
      distance,
      estimatedProfit: baseProfit,
      matchScore,
      isRecommended: false,
      reasons,
      weight: `${(5 + Math.floor(rand() * 20))} MT`,
      company,
    });
  }

  const bestIdx = returnLoads.reduce(
    (best, curr, idx) => (curr.matchScore > returnLoads[best].matchScore ? idx : best),
    0,
  );
  returnLoads[bestIdx].isRecommended = true;

  returnLoads.sort((a, b) => b.matchScore - a.matchScore);

  return returnLoads;
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
