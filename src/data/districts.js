export const DISTRICTS = {
  'all': {
    id: 'all',
    label: 'All Districts',
    bounds: [39.1977, -6.1659], // Zanzibar center coordinates
    baselineData: {
      averageCatch: 125.5,
      averageRevenue: 45000,
      numberOfVessels: 450,
      mainSpecies: ['Tuna', 'Mackerel', 'Sardines']
    }
  },
  'north-unguja': {
    id: 'north-unguja',
    label: 'North Unguja',
    bounds: [39.2890, -5.8726],
    baselineData: {
      averageCatch: 98.2,
      averageRevenue: 35000,
      numberOfVessels: 180,
      mainSpecies: ['Tuna', 'Mackerel']
    }
  },
  'south-unguja': {
    id: 'south-unguja',
    label: 'South Unguja',
    bounds: [39.3294, -6.3026],
    baselineData: {
      averageCatch: 145.3,
      averageRevenue: 52000,
      numberOfVessels: 210,
      mainSpecies: ['Sardines', 'Mackerel']
    }
  },
  'pemba': {
    id: 'pemba',
    label: 'Pemba',
    bounds: [39.7883, -5.2137],
    baselineData: {
      averageCatch: 167.8,
      averageRevenue: 58000,
      numberOfVessels: 260,
      mainSpecies: ['Tuna', 'Octopus']
    }
  }
}; 