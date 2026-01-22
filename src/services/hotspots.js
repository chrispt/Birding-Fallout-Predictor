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
  { name: 'Anahuac NWR', lat: 29.6100, lon: -94.4500, state: 'TX', region: 'gulf', description: 'Excellent for songbirds and shorebirds' },
  { name: 'Bolivar Flats', lat: 29.3833, lon: -94.6333, state: 'TX', region: 'gulf', description: 'Famous shorebird site with up to 35 species' },
  { name: 'Baytown Nature Center', lat: 29.7300, lon: -94.9600, state: 'TX', region: 'gulf', description: '500-acre peninsula on Great Texas Coastal Birding Trail' },
  { name: 'Estero Llano Grande SP', lat: 26.1283, lon: -97.9444, state: 'TX', region: 'gulf', description: 'Record 133 species in one day including 18 warbler species' },
  { name: 'Sea Rim State Park', lat: 29.6800, lon: -94.0400, state: 'TX', region: 'gulf', description: 'Upper Texas coast marshes and beach' },
  { name: 'San Luis Pass', lat: 29.0833, lon: -95.1333, state: 'TX', region: 'gulf', description: 'Galveston area migrant site' },

  // Louisiana Gulf Coast
  { name: 'Grand Isle', lat: 29.2364, lon: -89.9872, state: 'LA', region: 'gulf', description: 'Louisiana barrier island hotspot' },
  { name: 'Cameron Prairie NWR', lat: 29.8833, lon: -93.0333, state: 'LA', region: 'gulf', description: 'Coastal Louisiana refuge' },
  { name: 'Peveto Woods', lat: 29.7667, lon: -93.4500, state: 'LA', region: 'gulf', description: 'Famous Louisiana fallout site' },
  { name: 'Johnson\'s Bayou', lat: 29.7583, lon: -93.6083, state: 'LA', region: 'gulf', description: 'Chenier plain migrant trap' },
  { name: 'Sabine NWR', lat: 29.9000, lon: -93.3500, state: 'LA', region: 'gulf', description: 'Excellent for waterfowl and shorebirds along with songbirds' },

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
  { name: 'Fort Zachary Taylor SP', lat: 24.5450, lon: -81.8100, state: 'FL', region: 'gulf', description: 'Key West migrant trap and Caribbean specialties' },

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
  { name: 'Rondeau Provincial Park', lat: 42.2667, lon: -81.8667, state: 'ON', region: 'greatlakes', description: 'Famous for Prothonotary Warblers and Carolinian forest species' },
  { name: 'Long Point', lat: 42.5833, lon: -80.0500, state: 'ON', region: 'greatlakes', description: 'One of the Big 3 Lake Erie migration sites' },
  { name: 'Pelee Island', lat: 41.7833, lon: -82.6667, state: 'ON', region: 'greatlakes', description: 'Confluence of two major flyways, 314 species recorded' },
  { name: 'Headlands Dunes State Nature Preserve', lat: 41.7600, lon: -81.2800, state: 'OH', region: 'greatlakes', description: 'Lake Erie shoreline preserve' },

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
  { name: 'South Cape May Meadows', lat: 38.9350, lon: -74.9350, state: 'NJ', region: 'atlantic', description: 'TNC preserve excellent for shorebirds and migrants' },
  { name: 'Wellfleet Bay Wildlife Sanctuary', lat: 41.9167, lon: -70.0667, state: 'MA', region: 'atlantic', description: 'Cape Cod migration hotspot' },
  { name: 'Monomoy NWR', lat: 41.5833, lon: -69.9833, state: 'MA', region: 'atlantic', description: 'Cape Cod shorebird and migrant site' },
  { name: 'Dagny Johnson Key Largo Hammock', lat: 25.2500, lon: -80.3667, state: 'FL', region: 'atlantic', description: 'Florida Keys botanical park for migrants' },
  { name: 'Milford Point', lat: 41.2000, lon: -73.1000, state: 'CT', region: 'atlantic', description: 'One of Connecticut best birding spots for fall migration' },

  // Interior/Central Flyway
  { name: 'Cheyenne Bottoms', lat: 38.4667, lon: -98.6500, state: 'KS', region: 'central', description: 'Central Kansas shorebird site' },
  { name: 'Quivira NWR', lat: 38.1333, lon: -98.4833, state: 'KS', region: 'central', description: 'Kansas inland marsh' },
  { name: 'Salt Plains NWR', lat: 36.7500, lon: -98.2167, state: 'OK', region: 'central', description: 'Oklahoma shorebird stopover' },
  { name: 'Padre Island NS', lat: 27.0000, lon: -97.3833, state: 'TX', region: 'central', description: 'Longest undeveloped barrier island' },
  { name: 'Brazos Bend SP', lat: 29.3750, lon: -95.6200, state: 'TX', region: 'central', description: 'Texas wetlands with excellent birding' },
  { name: 'Laguna Atascosa NWR', lat: 26.2300, lon: -97.3500, state: 'TX', region: 'central', description: 'South Texas refuge on Central Flyway' },

  // Raptor Watch Sites
  { name: 'Hawk Mountain Sanctuary', lat: 40.6350, lon: -75.9875, state: 'PA', region: 'raptor', description: 'Americas first raptor sanctuary, famous fall hawk watch' },
  { name: 'Waggoners Gap', lat: 40.3167, lon: -77.3667, state: 'PA', region: 'raptor', description: 'Kittatinny Ridge hawk watch site' },
  { name: 'Rockfish Gap', lat: 38.0333, lon: -78.8500, state: 'VA', region: 'raptor', description: 'Major Broad-winged Hawk site' },
  { name: 'Hawk Ridge', lat: 46.8500, lon: -92.0333, state: 'MN', region: 'raptor', description: 'Tens of thousands of raptors pass each fall' },
  { name: 'Holiday Beach', lat: 42.0333, lon: -83.0667, state: 'ON', region: 'raptor', description: 'Canadian raptor migration site' },
  { name: 'Detroit River Hawkwatch', lat: 42.0667, lon: -83.1500, state: 'MI', region: 'raptor', description: 'Major Broad-winged Hawk flights' },
  { name: 'Corpus Christi Hawkwatch', lat: 27.7500, lon: -97.4000, state: 'TX', region: 'raptor', description: 'Largest raptor counts in US, 200k+ raptors possible' },
  { name: 'Florida Keys Hawkwatch', lat: 24.6833, lon: -81.5000, state: 'FL', region: 'raptor', description: 'Large Peregrine Falcon and Osprey flights' },
  { name: 'Golden Gate Raptor Observatory', lat: 37.8333, lon: -122.5000, state: 'CA', region: 'raptor', description: 'Marin Headlands hawk watch' },
  { name: 'Goshute Mountains', lat: 40.0167, lon: -114.2167, state: 'NV', region: 'raptor', description: 'Major Pacific Flyway site' },
  { name: 'Manzano Mountains', lat: 34.6167, lon: -106.4000, state: 'NM', region: 'raptor', description: 'HawkWatch International site near Albuquerque' },
  { name: 'Veracruz River of Raptors', lat: 19.5000, lon: -96.9167, state: 'MX', region: 'raptor', description: 'Worlds largest raptor migration, 4.5 million raptors' },

  // Shorebird Sites
  { name: 'Heislerville WMA', lat: 39.2225, lon: -75.0117, state: 'NJ', region: 'shorebird', description: 'Delaware Bay horseshoe crab and Red Knot spectacle' },
  { name: 'Reeds Beach', lat: 39.1167, lon: -74.9333, state: 'NJ', region: 'shorebird', description: 'Delaware Bay shorebird staging area' },
  { name: 'Slaughter Beach', lat: 38.9333, lon: -75.3000, state: 'DE', region: 'shorebird', description: 'Delaware Bay shorebird beach' },
  { name: 'Mispillion Harbor', lat: 38.9417, lon: -75.3167, state: 'DE', region: 'shorebird', description: 'DuPont Nature Center, best for Red Knots' },
  { name: 'Bowers Beach', lat: 39.0583, lon: -75.4000, state: 'DE', region: 'shorebird', description: 'Delaware Bay shorebird site' },
  { name: 'Kitts Hummock', lat: 39.2000, lon: -75.4167, state: 'DE', region: 'shorebird', description: 'Delaware Bay shorebird viewing' },
  { name: 'Port Mahon Road', lat: 39.1500, lon: -75.4000, state: 'DE', region: 'shorebird', description: 'Delaware Bay shorebird beach' },
  { name: 'Gandys Beach', lat: 39.2833, lon: -75.2833, state: 'NJ', region: 'shorebird', description: 'TNC preserve on Delaware Bay' },

  // Waterfowl Spectacles
  { name: 'Loess Bluffs NWR', lat: 40.0681, lon: -95.2439, state: 'MO', region: 'waterfowl', description: 'Over 1.2 million Snow Geese possible' },
  { name: 'Bosque del Apache NWR', lat: 33.8000, lon: -106.8833, state: 'NM', region: 'waterfowl', description: 'Famous for Sandhill Cranes and Snow Geese' },
  { name: 'Horicon NWR', lat: 43.5000, lon: -88.6167, state: 'WI', region: 'waterfowl', description: 'Largest freshwater cattail marsh in US, 200k Canada Geese' },

  // Western Sites
  { name: 'Point Reyes National Seashore', lat: 38.0700, lon: -122.8700, state: 'CA', region: 'western', description: '490 species recorded, famous vagrant trap' },
  { name: 'Madera Canyon', lat: 31.7250, lon: -110.8750, state: 'AZ', region: 'western', description: 'Southeast Arizona sky island migration corridor' },
  { name: 'Cave Creek Canyon', lat: 31.8833, lon: -109.1667, state: 'AZ', region: 'western', description: 'Chiricahua Mountains migration site' },
  { name: 'Ramsey Canyon Preserve', lat: 31.4500, lon: -110.3000, state: 'AZ', region: 'western', description: 'Huachuca Mountains hummingbird haven' },
  { name: 'Patagonia Lake SP', lat: 31.4833, lon: -110.8333, state: 'AZ', region: 'western', description: 'Southeast Arizona birding hotspot' },
  { name: 'Salton Sea', lat: 33.2500, lon: -115.8333, state: 'CA', region: 'western', description: 'Important western shorebird and waterbird site' },
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
