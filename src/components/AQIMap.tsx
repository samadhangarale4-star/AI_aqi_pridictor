import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AQICategory, Coordinates, RegionalStation } from '../types';
import { AQI_CATEGORIES } from '../utils/aqi';
import { MapPin, Navigation, Layers, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AQIMapProps {
  areaName: string;
  centerCoords: Coordinates;
  currentAqi: number;
  currentCategory: AQICategory;
  regionalStations: RegionalStation[];
  onSelectStation?: (stationName: string) => void;
}

export default function AQIMap({
  areaName,
  centerCoords,
  currentAqi,
  currentCategory,
  regionalStations,
  onSelectStation,
}: AQIMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showRadiusRings, setShowRadiusRings] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 12,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      // CartoDB Voyager tile layer for crisp, modern environmental cartography
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      circlesLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center & markers when props or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;

    if (!map || !markersLayer || !circlesLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    const centerConfig = AQI_CATEGORIES[currentCategory] || AQI_CATEGORIES.Moderate;

    // 1. Target Area Main Center Marker (Pulsing prominent badge)
    const centerIconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-10 h-10 rounded-full ${centerConfig.dotColor} opacity-25 animate-ping"></span>
        <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white shadow-lg border-2 border-white ring-2 ring-slate-900/20">
          <span class="w-2.5 h-2.5 rounded-full ${centerConfig.dotColor}"></span>
          <span class="text-xs font-bold tracking-tight">${areaName}</span>
          <span class="text-[11px] font-mono px-1.5 py-0.2 rounded ${centerConfig.pillBg} font-bold">${currentAqi}</span>
        </div>
      </div>
    `;

    const centerIcon = L.divIcon({
      html: centerIconHtml,
      className: 'aqi-center-marker-container',
      iconSize: [0, 0],
    });

    const centerMarker = L.marker([centerCoords.lat, centerCoords.lng], {
      icon: centerIcon,
      zIndexOffset: 1000,
    });

    centerMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px; font-size: 13px;">${areaName}</div>
        <div style="color: #64748b; margin-bottom: 6px;">Primary Monitoring Target Node</div>
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #475569;">Predicted AQI:</span>
          <strong style="font-size: 15px; color: #0f172a;">${currentAqi} AQI</strong>
        </div>
        <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${centerConfig.chartColor}; color: white;">
          ${currentCategory}
        </div>
      </div>
    `);

    markersLayer.addLayer(centerMarker);

    // Center radius ring
    if (showRadiusRings) {
      const centerCircle = L.circle([centerCoords.lat, centerCoords.lng], {
        radius: 2800,
        color: centerConfig.chartColor,
        fillColor: centerConfig.chartColor,
        fillOpacity: 0.07,
        weight: 1.5,
        dashArray: '4, 4',
      });
      circlesLayer.addLayer(centerCircle);
    }

    // 2. Regional Stations Markers
    const bounds = L.latLngBounds([[centerCoords.lat, centerCoords.lng]]);

    regionalStations.forEach((station) => {
      if (filterCategory !== 'all' && station.category !== filterCategory) {
        return;
      }

      bounds.extend([station.lat, station.lng]);

      const stationConfig = AQI_CATEGORIES[station.category] || AQI_CATEGORIES.Moderate;

      const stationIconHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 text-slate-800 shadow-md border border-slate-300 hover:border-slate-800 hover:scale-105 transition-all">
            <span class="w-2 h-2 rounded-full ${stationConfig.dotColor}"></span>
            <span class="font-mono text-[11px] font-bold">${station.aqi}</span>
          </div>
        </div>
      `;

      const stationIcon = L.divIcon({
        html: stationIconHtml,
        className: 'aqi-station-marker-container',
        iconSize: [0, 0],
      });

      const marker = L.marker([station.lat, station.lng], { icon: stationIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 190px;">
          <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${station.name}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">Distance: ${station.distanceKm} km • ${station.temperature}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #475569;">Station AQI:</span>
            <strong style="font-size: 14px; color: #0f172a;">${station.aqi} AQI</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${stationConfig.chartColor}; color: white;">
              ${station.category}
            </span>
            <span style="font-size: 11px; color: #64748b; font-family: monospace;">Primary: ${station.mainPollutant}</span>
          </div>
          <button id="focus-station-btn-${station.id}" style="width: 100%; padding: 4px 8px; font-size: 11px; font-weight: 600; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Predict This Regional Area
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setSelectedStationId(station.id);
        const btn = document.getElementById(`focus-station-btn-${station.id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => {
            onSelectStation(station.name.split(' - ')[0] || station.name);
          };
        }
      });

      markersLayer.addLayer(marker);

      if (showRadiusRings) {
        const stationCircle = L.circle([station.lat, station.lng], {
          radius: 1200,
          color: stationConfig.chartColor,
          fillColor: stationConfig.chartColor,
          fillOpacity: 0.05,
          weight: 1,
        });
        circlesLayer.addLayer(stationCircle);
      }
    });

    // Smoothly fly or fit bounds to reveal regional stations
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else {
      map.setView([centerCoords.lat, centerCoords.lng], 12);
    }
  }, [centerCoords, currentAqi, currentCategory, regionalStations, areaName, showRadiusRings, filterCategory]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 12, { duration: 1.2 });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Map Header Controls */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Regional Atmospheric Sensor Grid
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-semibold">
                {regionalStations.length} Active Nodes
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive geographic overlay of {areaName} and adjacent monitoring stations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRadiusRings(!showRadiusRings)}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
              showRadiusRings
                ? 'bg-teal-50 text-teal-800 border-teal-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle dispersion influence radii"
          >
            {showRadiusRings ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Dispersion Rings</span>
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all font-medium cursor-pointer shadow-2xs"
            title="Re-center map on target area"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-center</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[340px] sm:h-[380px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Floating Station Summary Strip */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-[500] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-md text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                Regional Station Readings
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Click pin for details
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 transition-all cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({regionalStations.length})
              </button>
              {Object.keys(AQI_CATEGORIES).map((catName) => {
                const count = regionalStations.filter((s) => s.category === catName).length;
                if (count === 0) return null;
                const config = AQI_CATEGORIES[catName as AQICategory];
                const isSelected = filterCategory === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setFilterCategory(isSelected ? 'all' : catName)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'ring-2 ring-slate-900 ' + config.badgeBg + ' ' + config.badgeBorder + ' ' + config.badgeText
                        : config.badgeBg + ' ' + config.badgeBorder + ' ' + config.badgeText + ' hover:opacity-80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                    <span>{catName} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Map Footer Information */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-time spatial interpolation calibrated with local boundary nodes</span>
        </div>
        <div>
          <span>Lat: {centerCoords.lat.toFixed(4)} • Lng: {centerCoords.lng.toFixed(4)}</span>
        </div>
      </div>
    </section>
  );
}
