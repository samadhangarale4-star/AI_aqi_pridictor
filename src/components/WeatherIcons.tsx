import React from 'react';

interface WeatherIconProps {
  className?: string;
  size?: number;
}

// 1. Radiant Golden Glowing Sun
export const RealisticSunIcon: React.FC<WeatherIconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <defs>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
        <stop offset="35%" stopColor="#facc15" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#eab308" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="sunCore" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
      <filter id="sunBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Outer luminous glow corona */}
    <circle cx="50" cy="50" r="44" fill="url(#sunGlow)" />
    
    {/* Sun rays */}
    <g stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
      <line x1="50" y1="8" x2="50" y2="18" />
      <line x1="50" y1="82" x2="50" y2="92" />
      <line x1="8" y1="50" x2="18" y2="50" />
      <line x1="82" y1="50" x2="92" y2="50" />
      <line x1="20" y1="20" x2="27" y2="27" />
      <line x1="73" y1="73" x2="80" y2="80" />
      <line x1="20" y1="80" x2="27" y2="73" />
      <line x1="73" y1="27" x2="80" y2="20" />
    </g>

    {/* Brilliant Sun Core */}
    <circle cx="50" cy="50" r="24" fill="url(#sunCore)" filter="url(#sunBlur)" />
  </svg>
);

// 2. Realistic Cumulus White Cloud
export const RealisticCloudIcon: React.FC<WeatherIconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <defs>
      <linearGradient id="cloudBody" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <linearGradient id="cloudHighlight" x1="30" y1="25" x2="70" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.25" />
      </filter>
    </defs>
    
    {/* Main volumetric cloud */}
    <g filter="url(#cloudShadow)">
      <path
        d="M26 68 C17 68 12 60 14 51 C15 44 21 39 28 39 C30 28 40 20 52 20 C64 20 74 27 77 38 C84 38 90 44 90 52 C90 61 83 68 74 68 Z"
        fill="url(#cloudBody)"
      />
      {/* Top rim highlight */}
      <path
        d="M28 39 C30 28 40 20 52 20 C64 20 74 27 77 38 C72 35 62 33 52 33 C40 33 32 36 28 39 Z"
        fill="url(#cloudHighlight)"
      />
    </g>
  </svg>
);

// 3. Sun Peeking Behind Fluffy Cloud (Partly Cloudy)
export const RealisticPartlyCloudyIcon: React.FC<WeatherIconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <defs>
      <radialGradient id="partlySunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#facc15" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="partlySunCore" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#fef08a" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
      <linearGradient id="partlyCloudBody" x1="50" y1="30" x2="50" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="65%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <filter id="partlyShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Sun peeking from top-left */}
    <g transform="translate(-6, -6)">
      <circle cx="38" cy="38" r="28" fill="url(#partlySunGlow)" />
      {/* Rays */}
      <g stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
        <line x1="38" y1="12" x2="38" y2="18" />
        <line x1="12" y1="38" x2="18" y2="38" />
        <line x1="20" y1="20" x2="25" y2="25" />
        <line x1="56" y1="20" x2="51" y2="25" />
      </g>
      <circle cx="38" cy="38" r="16" fill="url(#partlySunCore)" />
    </g>

    {/* Front Cloud */}
    <g filter="url(#partlyShadow)">
      <path
        d="M32 74 C23 74 18 67 20 59 C21 53 26 48 33 48 C35 39 44 32 55 32 C66 32 75 38 78 47 C85 47 91 53 91 60 C91 68 85 74 76 74 Z"
        fill="url(#partlyCloudBody)"
      />
    </g>
  </svg>
);

// 4. Rainy Cloud with Falling Streaks
export const RealisticRainyIcon: React.FC<WeatherIconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <defs>
      <linearGradient id="rainCloudBody" x1="50" y1="15" x2="50" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="rainStreak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
      </linearGradient>
      <filter id="rainShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.2" />
      </filter>
    </defs>

    {/* Cloud body */}
    <g filter="url(#rainShadow)">
      <path
        d="M26 60 C17 60 12 53 14 45 C15 39 21 34 28 34 C30 24 40 17 52 17 C64 17 74 23 77 33 C84 33 90 39 90 46 C90 54 83 60 74 60 Z"
        fill="url(#rainCloudBody)"
      />
    </g>

    {/* Rain Streaks */}
    <g stroke="url(#rainStreak)" strokeWidth="2" strokeLinecap="round">
      <line x1="32" y1="67" x2="30" y2="82" opacity="0.9" />
      <line x1="42" y1="65" x2="40" y2="86" opacity="0.85" />
      <line x1="52" y1="67" x2="50" y2="84" opacity="0.9" />
      <line x1="62" y1="65" x2="60" y2="87" opacity="0.85" />
      <line x1="72" y1="68" x2="70" y2="81" opacity="0.8" />
    </g>
  </svg>
);

// 5. Thunderstorm Cloud with Lightning & Rain
export const RealisticThunderstormIcon: React.FC<WeatherIconProps> = ({ className = '', size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
  >
    <defs>
      <linearGradient id="stormCloudBody" x1="50" y1="15" x2="50" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="lightningGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>

    {/* Storm Cloud */}
    <path
      d="M26 58 C17 58 12 51 14 43 C15 37 21 32 28 32 C30 22 40 15 52 15 C64 15 74 21 77 31 C84 31 90 37 90 44 C90 52 83 58 74 58 Z"
      fill="url(#stormCloudBody)"
    />

    {/* Rain Streaks */}
    <g stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75">
      <line x1="30" y1="64" x2="27" y2="78" />
      <line x1="39" y1="65" x2="36" y2="83" />
      <line x1="68" y1="65" x2="65" y2="82" />
      <line x1="77" y1="64" x2="74" y2="77" />
    </g>

    {/* Electric Cyan Lightning Bolt */}
    <path
      d="M52 52 L43 68 L50 68 L44 88 L59 66 L51 66 Z"
      fill="url(#lightningGrad)"
      stroke="#ffffff"
      strokeWidth="0.8"
      filter="url(#lightningGlow)"
    />
  </svg>
);

export type WeatherConditionKey = 'sunny' | 'partlyCloudy' | 'rainy' | 'cloudy' | 'thunderstorm';

export const WeatherIconMap: Record<WeatherConditionKey, React.FC<WeatherIconProps>> = {
  sunny: RealisticSunIcon,
  partlyCloudy: RealisticPartlyCloudyIcon,
  rainy: RealisticRainyIcon,
  cloudy: RealisticCloudIcon,
  thunderstorm: RealisticThunderstormIcon,
};

