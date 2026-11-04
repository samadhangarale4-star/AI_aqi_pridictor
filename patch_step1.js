const fs = require('fs');

let code = fs.readFileSync('src/App.tsx.bak', 'utf8');

// 1. Update imports from ./utils/aqi
code = code.replace(
  "import { \n  AQI_CATEGORIES, \n  POLLUTANT_COLORS,",
  "import { \n  AQI_CATEGORIES, \n  INDIAN_AQI_CATEGORIES,\n  POLLUTANT_COLORS,\n  getIndianCategoryFromAQI,\n  aqiToPm25,\n  aqiToPm10,\n  aqiToNo2,\n  aqiToO3,"
);

// 2. Update imports from ./types
code = code.replace(
  "import { \n  AQICategory, \n  PredictionResult,",
  "import { \n  AQICategory, \n  IndianAQICategory,\n  PredictionResult,"
);

// 3. Update imports from lucide-react
code = code.replace(
  "  MapPin\n} from 'lucide-react';",
  "  MapPin,\n  History,\n  ShieldAlert,\n  Info,\n  Users,\n  Baby,\n  Bike,\n  Dumbbell,\n  Footprints,\n  AlertTriangle,\n  HeartPulse\n} from 'lucide-react';"
);

// 4. Update dashboardTab state and add aqiStandard
code = code.replace(
  "const [dashboardTab, setDashboardTab] = useState<'all' | 'analytics' | 'scrubber' | 'forecast' | 'advisory'>('all');",
  "const [dashboardTab, setDashboardTab] = useState<'all' | 'forecast' | 'pollutants' | 'activities' | 'advisory' | 'historical' | 'analytics' | 'scrubber'>('all');\n  const [aqiStandard, setAqiStandard] = useState<'CPCB' | 'EPA'>('CPCB');"
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('Step 1 applied successfully');

