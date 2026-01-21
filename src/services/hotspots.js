// Static hotspot data - known fallout and migration sites

export const FALLOUT_HOTSPOTS = [
  // Texas Gulf Coast
  { name: 'High Island - Boy Scout Woods', lat: 29.5647, lon: -94.3912, state: 'TX', region: 'gulf', description: 'Premier Gulf Coast fallout site' },
  { name: 'High Island - Smith Oaks', lat: 29.5589, lon: -94.3867, state: 'TX', region: 'gulf', description: 'Classic fallout location with rookery' },
  { name: 'South Padre Island', lat: 26.1044, lon: -97.1650, state: 'TX', region: 'gulf', description: 'Lower Texas coast migrant trap' },
  { name: 'Galveston Island State Park', lat: 29.2044, lon: -94.9692, state: 'TX', region: 'gulf', description: 'Gulf Coast barrier island' },
  { name: 'Sabine Woods', lat: 29.7361, lon: -93.8683, state: 'TX', region: 'gulf', description: 'Texas Ornithological Society sanctuary' },
  { name: 'Lafitte\'s Cove', lat: 29.2789, lon: -94.9147, state: 'TX', region: 'gulf', description: 'Galveston Island migrant trap' },
  { name: 'Quintana Neotropical Bird Sanctuary', lat: 28.9183, lon: -95.3089, state: 'TX', region: 'gulf', description: 'Coastal oak motte sanctuary' },
  { name: 'San Bernard NWR', lat: 28.8933, lon: -95.5667, state: 'TX', region: 'gulf', description: 'Coastal refuge for migrants' },
  { name: 'Aransas NWR', lat: 28.3047, lon: -96.8017, state: 'TX', region: 'gulf', description: 'Whooping Crane wintering grounds' },
  { name: 'Bentsen-Rio Grande Valley SP', lat: 26.1736, lon: -98.3847, state: 'TX', region: 'gulf', description: 'South Texas specialty site' },

  // Louisiana Gulf Coast
  { name: 'Grand Isle', lat: 29.2364, lon: -89.9872, state: 'LA', region: 'gulf', description: 'Louisiana barrier island hotspot' },
  { name: 'Cameron Prairie NWR', lat: 29.8833, lon: -93.0333, state: 'LA', region: 'gulf', description: 'Coastal Louisiana refuge' },
  { name: 'Peveto Woods', lat: 29.7667, lon: -93.4500, state: 'LA', region: 'gulf', description: 'Famous Louisiana fallout site' },
  { name: 'Johnson\'s Bayou', lat: 29.7583, lon: -93.6083, state: 'LA', region: 'gulf', description: 'Chenier plain migrant trap' },

  // Alabama/Mississippi Gulf Coast
  { name: 'Dauphin Island', lat: 30.2528, lon: -88.1089, state: 'AL', region: 'gulf', description: 'Gulf Coast barrier island' },
  { name: 'Fort Morgan', lat: 30.2283, lon: -88.0242, state: 'AL', region: 'gulf', description: 'Alabama coast migrant concentration' },
  { name: 'Bon Secour NWR', lat: 30.2472, lon: -87.8236, state: 'AL', region: 'gulf', description: 'Alabama coastal refuge' },
  { name: 'Gulf Islands NS - MS', lat: 30.3167, lon: -88.9333, state: 'MS', region: 'gulf', description: 'Mississippi barrier islands' },

  // Florida
  { name: 'Fort De Soto Park', lat: 27.6164, lon: -82.7372, state: 'FL', region: 'gulf', description: 'Tampa Bay migrant hotspot' },
  { name: 'Dry Tortugas NP', lat: 24.6285, lon: -82.8732, state: 'FL', region: 'gulf', description: 'Legendary spring fallout site' },
  { name: 'St. George Island SP', lat: 29.6517, lon: -84.8658, state: 'FL', region: 'gulf', description: 'Florida Panhandle barrier island' },
  { name: 'Fort Pickens', lat: 30.3192, lon: -87.2889, state: 'FL', region: 'gulf', description: 'Pensacola area migrant trap' },

  // Great Lakes Region
  { name: 'Point Pelee NP', lat: 41.9628, lon: -82.5181, state: 'ON', region: 'greatlakes', description: 'Great Lakes migration funnel' },
  { name: 'Magee Marsh WA', lat: 41.6189, lon: -83.1978, state: 'OH', region: 'greatlakes', description: 'Warbler Capital of the World' },
  { name: 'Ottawa NWR', lat: 41.6261, lon: -83.2383, state: 'OH', region: 'greatlakes', description: 'Adjacent to Magee Marsh' },
  { name: 'Crane Creek SP', lat: 41.6278, lon: -83.1944, state: 'OH', region: 'greatlakes', description: 'Part of Magee Marsh complex' },
  { name: 'Maumee Bay SP', lat: 41.6817, lon: -83.3733, state: 'OH', region: 'greatlakes', description: 'Lake Erie shoreline park' },
  { name: 'Whitefish Point', lat: 46.7717, lon: -84.9583, state: 'MI', region: 'greatlakes', description: 'Upper Michigan migration point' },
  { name: 'Tawas Point SP', lat: 44.2667, lon: -83.4500, state: 'MI', region: 'greatlakes', description: 'Lake Huron peninsula' },
  { name: 'Indiana Dunes NP', lat: 41.6533, lon: -87.0522, state: 'IN', region: 'greatlakes', description: 'Southern Lake Michigan shoreline' },
  { name: 'Illinois Beach SP', lat: 42.4264, lon: -87.8103, state: 'IL', region: 'greatlakes', description: 'Chicago area lakefront' },
  { name: 'Montrose Point', lat: 41.9639, lon: -87.6381, state: 'IL', region: 'greatlakes', description: 'Chicago Magic Hedge' },

  // Atlantic Coast
  { name: 'Cape May Point SP', lat: 38.9331, lon: -74.9597, state: 'NJ', region: 'atlantic', description: 'Atlantic coast fall hotspot' },
  { name: 'Cape May Bird Observatory', lat: 38.9486, lon: -74.9242, state: 'NJ', region: 'atlantic', description: 'Famous hawk watch and songbirds' },
  { name: 'Higbee Beach WMA', lat: 38.9567, lon: -74.9633, state: 'NJ', region: 'atlantic', description: 'Morning flight songbird site' },
  { name: 'Central Park Ramble', lat: 40.7794, lon: -73.9686, state: 'NY', region: 'atlantic', description: 'Urban migrant trap' },
  { name: 'Prospect Park', lat: 40.6602, lon: -73.9690, state: 'NY', region: 'atlantic', description: 'Brooklyn urban oasis' },
  { name: 'Jamaica Bay WR', lat: 40.6167, lon: -73.8333, state: 'NY', region: 'atlantic', description: 'NYC shorebird and migrant site' },
  { name: 'Jones Beach SP', lat: 40.5917, lon: -73.5089, state: 'NY', region: 'atlantic', description: 'Long Island barrier beach' },
  { name: 'Block Island', lat: 41.1717, lon: -71.5569, state: 'RI', region: 'atlantic', description: 'Rhode Island offshore island' },
  { name: 'Plum Island/Parker River NWR', lat: 42.7667, lon: -70.8167, state: 'MA', region: 'atlantic', description: 'Massachusetts barrier island' },
  { name: 'Mount Auburn Cemetery', lat: 42.3722, lon: -71.1461, state: 'MA', region: 'atlantic', description: 'Historic Boston migrant trap' },
  { name: 'Monhegan Island', lat: 43.7644, lon: -69.3164, state: 'ME', region: 'atlantic', description: 'Maine offshore island' },

  // Interior/Central Flyway
  { name: 'Cheyenne Bottoms', lat: 38.4667, lon: -98.6500, state: 'KS', region: 'central', description: 'Central Kansas shorebird site' },
  { name: 'Quivira NWR', lat: 38.1333, lon: -98.4833, state: 'KS', region: 'central', description: 'Kansas inland marsh' },
  { name: 'Salt Plains NWR', lat: 36.7500, lon: -98.2167, state: 'OK', region: 'central', description: 'Oklahoma shorebird stopover' },
  { name: 'Padre Island NS', lat: 27.0000, lon: -97.3833, state: 'TX', region: 'central', description: 'Longest undeveloped barrier island' },
]

// Get hotspots filtered by region
export function getHotspotsByRegion(region) {
  if (!region || region === 'all') return FALLOUT_HOTSPOTS
  return FALLOUT_HOTSPOTS.filter(h => h.region === region)
}

// Get all unique regions
export function getRegions() {
  const regions = [...new Set(FALLOUT_HOTSPOTS.map(h => h.region))]
  return regions.sort()
}

// Get all unique states
export function getStates() {
  const states = [...new Set(FALLOUT_HOTSPOTS.map(h => h.state))]
  return states.sort()
}

// Get hotspots filtered by state
export function getHotspotsByState(state) {
  if (!state || state === 'all') return FALLOUT_HOTSPOTS
  return FALLOUT_HOTSPOTS.filter(h => h.state === state)
}
