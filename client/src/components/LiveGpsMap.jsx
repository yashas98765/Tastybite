import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Crosshair,
  Maximize2,
  Minimize2,
  Store,
  MapPin,
  Truck,
  Zap,
  Radio,
  Clock,
  Compass,
  Layers,
  Plus,
  Minus
} from 'lucide-react';

const TILE_CONFIGS = {
  streets: {
    name: 'Street View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19
  }
};

// Accurate Bangalore locality coordinates database
const BANGALORE_LOCALITIES = [
  { match: ['green glen', 'bellandur', 'ecospace'], lat: 12.9285, lng: 77.6715, label: 'Green Glen Layout, Bellandur' },
  { match: ['koramangala'], lat: 12.9352, lng: 77.6245, label: 'Koramangala' },
  { match: ['indiranagar', '100 ft', '100 feet', 'defence colony'], lat: 12.9716, lng: 77.6412, label: 'Indiranagar' },
  { match: ['hsr', 'hsr layout', 'sector'], lat: 12.9121, lng: 77.6446, label: 'HSR Layout' },
  { match: ['whitefield', 'itpl', 'hope farm', 'kadugodi'], lat: 12.9698, lng: 77.7500, label: 'Whitefield' },
  { match: ['electronic city', 'e-city', 'phase 1', 'phase 2'], lat: 12.8452, lng: 77.6602, label: 'Electronic City' },
  { match: ['marathahalli', 'multiplex'], lat: 12.9591, lng: 77.6974, label: 'Marathahalli' },
  { match: ['sarjapur', 'sarjapur road', 'wipro'], lat: 12.9081, lng: 77.6835, label: 'Sarjapur Road' },
  { match: ['jayanagar'], lat: 12.9250, lng: 77.5938, label: 'Jayanagar' },
  { match: ['jp nagar'], lat: 12.9077, lng: 77.5855, label: 'JP Nagar' },
  { match: ['btm', 'btm layout', 'silk board'], lat: 12.9166, lng: 77.6101, label: 'BTM Layout' },
  { match: ['lavelle', 'lavelle road', 'shanthala nagar', 'kasturba'], lat: 12.9719, lng: 77.5996, label: 'Lavelle Road' },
  { match: ['mg road', 'brigade', 'church street', 'central district'], lat: 12.9752, lng: 77.6042, label: 'MG Road' },
  { match: ['basavanagudi', 'gandhi bazaar', 'dosa camp'], lat: 12.9429, lng: 77.5739, label: 'Basavanagudi' },
  { match: ['domlur', 'egl', 'embassy golf', 'intermediate ring road'], lat: 12.9609, lng: 77.6387, label: 'Domlur' },
  { match: ['hal', 'old airport', 'airport road', 'murugeshpalya'], lat: 12.9558, lng: 77.6668, label: 'Old Airport Road' },
  { match: ['ulsoor', 'halasuru', 'someshwara'], lat: 12.9784, lng: 77.6218, label: 'Ulsoor' },
  { match: ['hebbal', 'manyata'], lat: 13.0358, lng: 77.5970, label: 'Hebbal' },
  { match: ['malleshwaram'], lat: 13.0031, lng: 77.5643, label: 'Malleshwaram' },
  { match: ['rajajinagar'], lat: 12.9915, lng: 77.5524, label: 'Rajajinagar' }
];

// Resolves real GPS coordinates from address strings
function resolveCoordinates(addressObj, fallback = [12.9285, 77.6715]) {
  if (addressObj?.lat && addressObj?.lng) {
    return [Number(addressObj.lat), Number(addressObj.lng)];
  }
  const text = `${addressObj?.street || ''} ${addressObj?.city || ''} ${addressObj?.state || ''} ${addressObj?.tag || ''}`.toLowerCase();
  for (const loc of BANGALORE_LOCALITIES) {
    if (loc.match.some(m => text.includes(m))) {
      return [loc.lat, loc.lng];
    }
  }
  return fallback;
}

// Generates realistic street-aligned waypoints across Bangalore roads
function generateStreetRoute(start, end) {
  // Check if route connects Central Bangalore (Lavelle Rd) and Bellandur (Green Glen)
  const isLavelleToBellandur = (Math.abs(start[0] - 12.9719) < 0.03 && Math.abs(end[0] - 12.9285) < 0.03);

  if (isLavelleToBellandur) {
    const waypoints = [
      [12.9719, 77.5996], // Lavelle Road (The Daily Roast Cafe)
      [12.9682, 77.6045], // Richmond Circle
      [12.9645, 77.6140], // Victoria Road / Hosur Rd
      [12.9620, 77.6250], // Austin Town / Intermediate Ring Rd
      [12.9605, 77.6360], // Domlur Flyover
      [12.9578, 77.6495], // EGL Inner Ring Rd
      [12.9560, 77.6625], // Old Airport Road
      [12.9485, 77.6705], // Wind Tunnel Road / Murugeshpalya
      [12.9385, 77.6815], // Outer Ring Road / HAL Airport
      [12.9320, 77.6755], // Bellandur Flyover & Ecospace
      [12.9285, 77.6715]  // Green Glen Layout, Bellandur (Customer Destination)
    ];

    const smoothPoints = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const steps = 4;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        smoothPoints.push([
          p1[0] + (p2[0] - p1[0]) * t,
          p1[1] + (p2[1] - p1[1]) * t
        ]);
      }
    }
    smoothPoints.push(waypoints[waypoints.length - 1]);
    return smoothPoints;
  }

  // Generic smooth street corridor generator
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const perpLat = -(end[1] - start[1]) * 0.12;
  const perpLng = (end[0] - start[0]) * 0.12;

  const points = [];
  const numSteps = 35;
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * (midLat + perpLat) + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * (midLng + perpLng) + t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

export default function LiveGpsMap({ order }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const activeTileLayerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTheme, setMapTheme] = useState('streets');
  const [speed, setSpeed] = useState(28);
  const [batteryLevel] = useState(92);

  // 1. Accurately resolve Restaurant GPS coordinates
  const restaurantCoords = useMemo(() => {
    if (order?.restaurant?.location?.lat && order?.restaurant?.location?.lng) {
      return [Number(order.restaurant.location.lat), Number(order.restaurant.location.lng)];
    }
    const restText = `${order?.restaurant?.name || ''} ${order?.restaurant?.location?.address || ''}`.toLowerCase();
    for (const loc of BANGALORE_LOCALITIES) {
      if (loc.match.some(m => restText.includes(m))) {
        return [loc.lat, loc.lng];
      }
    }
    return [12.9719, 77.5996]; // Lavelle Road default
  }, [order?.restaurant]);

  // 2. Accurately resolve Customer Delivery GPS coordinates
  const customerCoords = useMemo(() => {
    return resolveCoordinates(order?.deliveryAddress, [12.9285, 77.6715]);
  }, [order?.deliveryAddress]);

  // 3. Generate route between actual resolved points
  const routePoints = useMemo(() => {
    return generateStreetRoute(restaurantCoords, customerCoords);
  }, [restaurantCoords, customerCoords]);

  const [currentProgressIndex, setCurrentProgressIndex] = useState(5);
  const [currentCoords, setCurrentCoords] = useState(() => routePoints[5] || restaurantCoords);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const midLat = (restaurantCoords[0] + customerCoords[0]) / 2;
    const midLng = (restaurantCoords[1] + customerCoords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // High-Res No-Key Map Tiles
    const initialTileConfig = TILE_CONFIGS[mapTheme] || TILE_CONFIGS.streets;
    const tileLayer = L.tileLayer(initialTileConfig.url, {
      maxZoom: initialTileConfig.maxZoom
    }).addTo(map);
    activeTileLayerRef.current = tileLayer;

    // 1. Restaurant / Kitchen Marker
    const restaurantIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#1c1917; color:#ea580c; border:2.5px solid #ffffff; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.35);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
          </div>
          <span style="background:rgba(255,255,255,0.96); font-family:system-ui,sans-serif; color:#1c1917; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; margin-top:4px; box-shadow:0 3px 6px rgba(0,0,0,0.2); white-space:nowrap; border:1px solid #e7e5e4;">
            ${order?.restaurant?.name || 'The Daily Roast Cafe'}
          </span>
        </div>
      `,
      iconSize: [0, 0]
    });

    L.marker(restaurantCoords, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`<b>${order?.restaurant?.name || 'Restaurant'}</b><br/>Lavelle Road Kitchen`);

    // 2. Customer Destination Marker
    const customerIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background:#059669; color:#ffffff; border:2.5px solid #ffffff; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.35);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <span style="background:rgba(255,255,255,0.96); font-family:system-ui,sans-serif; color:#065f46; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; margin-top:4px; box-shadow:0 3px 6px rgba(0,0,0,0.2); white-space:nowrap; border:1px solid #a7f3d0;">
            ${order?.deliveryAddress?.street || 'Green Glen Layout, Bellandur'}
          </span>
        </div>
      `,
      iconSize: [0, 0]
    });

    L.marker(customerCoords, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>Delivery Destination</b><br/>${order?.deliveryAddress?.street || 'Flat 402, Green Glen Layout'}, ${order?.deliveryAddress?.city || 'Bellandur'}`);

    // 3. Glowing Road Polyline
    L.polyline(routePoints, {
      color: '#fb923c',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const mainPolyline = L.polyline(routePoints, {
      color: '#ea580c',
      weight: 4.5,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routePolylineRef.current = mainPolyline;

    // 4. Live Rider Dynamic Moving Marker
    const initialPos = routePoints[currentProgressIndex] || routePoints[0];
    setCurrentCoords(initialPos);

    const riderIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
          <!-- Pulsing Radar Ripple Effect -->
          <div style="position:absolute; width:64px; height:64px; border-radius:50%; background:rgba(234,88,12,0.3); animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; z-index:1;"></div>
          <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(234,88,12,0.25); z-index:2;"></div>
          
          <!-- Rider Badge -->
          <div style="position:relative; z-index:10; background:#ea580c; color:#ffffff; border:3px solid #ffffff; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 12px 20px -3px rgba(234,88,12,0.6);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4H14v9a1 1 0 0 0 1 1Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          </div>
          
          <div style="position:relative; z-index:10; background:#ea580c; color:#ffffff; font-family:system-ui,sans-serif; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px; margin-top:3px; box-shadow:0 4px 6px rgba(0,0,0,0.2); white-space:nowrap; border:1px solid #ffedd5;">
            ${order?.riderDetails?.name || 'Rider Ramesh'} (Live GPS)
          </div>
        </div>
      `,
      iconSize: [0, 0]
    });

    const riderMarker = L.marker(initialPos, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
    riderMarkerRef.current = riderMarker;

    // Fit route in view with generous padding to prevent HUD overlap
    map.fitBounds(mainPolyline.getBounds(), {
      paddingTopLeft: [70, 90],
      paddingBottomRight: [70, 75]
    });

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [restaurantCoords, customerCoords, routePoints]);

  // Tile theme switch handler
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }
    const config = TILE_CONFIGS[mapTheme] || TILE_CONFIGS.streets;
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom
    }).addTo(mapInstanceRef.current);
    activeTileLayerRef.current = newLayer;
  }, [mapTheme]);

  // Fullscreen resize handler
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 250);
    }
  }, [isFullscreen]);

  // Live GPS movement animation simulation along realistic street corridor
  useEffect(() => {
    const isOutForDelivery = order?.orderStatus === 'OUT_FOR_DELIVERY' || order?.orderStatus === 'READY' || order?.orderStatus === 'CONFIRMED' || order?.orderStatus === 'ORDER_PLACED';

    if (!isOutForDelivery) return;

    const interval = setInterval(() => {
      setCurrentProgressIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % routePoints.length;
        const nextCoords = routePoints[nextIdx];
        setCurrentCoords(nextCoords);

        setSpeed(Math.floor(26 + Math.random() * 10));

        if (riderMarkerRef.current && mapInstanceRef.current) {
          riderMarkerRef.current.setLatLng(nextCoords);
        }

        return nextIdx;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [routePoints, order?.orderStatus]);

  // Center on Rider
  const handleCenterRider = () => {
    if (mapInstanceRef.current && currentCoords) {
      mapInstanceRef.current.flyTo(currentCoords, 15, { duration: 1.2 });
    }
  };

  // Fit Full Route
  const handleFitRoute = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.flyToBounds(routePolylineRef.current.getBounds(), {
        paddingTopLeft: [70, 90],
        paddingBottomRight: [70, 75],
        duration: 1.2
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const remainingFraction = 1 - (currentProgressIndex / routePoints.length);
  const totalKm = 6.8;
  const remainingKm = Math.max(0.4, Number((totalKm * remainingFraction).toFixed(1)));

  return (
    <div className={`relative w-full max-w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 shadow-md transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[360px] sm:h-[400px]'
    }`}>
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />

      {/* Top Floating Telemetry HUD */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Live GPS Status */}
        <div className="bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl shadow-lg border border-stone-700/60 flex items-center gap-2.5 pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1 text-emerald-400">
              <Radio className="w-3 h-3" /> Live GPS Active
            </span>
            <span className="text-[9px] text-stone-400 font-mono block">
              Lat: {currentCoords[0]?.toFixed(4)} | Lng: {currentCoords[1]?.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Speed & ETA & Layer Switcher */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map Layer Switcher */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-stone-200 flex items-center gap-1 text-[11px] font-bold">
            <button
              onClick={() => setMapTheme('streets')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                mapTheme === 'streets' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                mapTheme === 'satellite' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTheme('osm')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                mapTheme === 'osm' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              OSM
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-stone-200 flex items-center gap-1.5 text-stone-800">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black font-mono">{speed} km/h</span>
          </div>

          <div className="bg-orange-600 text-white px-3 py-1.5 rounded-2xl shadow-md border border-orange-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{remainingKm} km away</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {/* Rider Status Pill */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-200 pointer-events-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-stone-900 block leading-tight">
              {order?.riderDetails?.name || 'Ramesh Kumar'}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              Vehicle: {order?.riderDetails?.vehicleNumber || 'KA 01 EB 4892'} • Battery: {batteryLevel}%
            </span>
          </div>
        </div>

        {/* Action Buttons & Zoom */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-9 h-9 bg-white/95 hover:bg-orange-600 hover:text-white text-stone-700 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-9 h-9 bg-white/95 hover:bg-orange-600 hover:text-white text-stone-700 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterRider}
            title="Center on Rider"
            className="w-9 h-9 bg-white/95 hover:bg-orange-600 hover:text-white text-stone-700 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitRoute}
            title="View Full Route"
            className="w-9 h-9 bg-white/95 hover:bg-orange-600 hover:text-white text-stone-700 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="w-9 h-9 bg-white/95 hover:bg-stone-900 hover:text-white text-stone-700 rounded-xl shadow-md border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
