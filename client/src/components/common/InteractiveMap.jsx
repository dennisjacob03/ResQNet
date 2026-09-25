import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createDivIcon = (htmlContent, className = '', iconSize = [40, 40], iconAnchor = [20, 40]) => {
  return L.divIcon({
    className: `custom-map-icon ${className}`,
    html: htmlContent,
    iconSize,
    iconAnchor,
    popupAnchor: [0, -38],
  });
};

const InteractiveMap = ({
  center = [9.9312, 76.2673],
  zoom = 11,
  rescueTeams = [],
  shelters = [],
  markers = [],
  userLocation = null,
  incidentLocation = null,
  assignedTeamLocation = null,
  destinationShelterLocation = null,
  showRoutePolyline = false,
  filterMode = 'all', // 'all' | 'teams' | 'shelters'
  height = '500px',
  onSelectMarker = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center || [9.9312, 76.2673],
        zoom,
        zoomControl: false,
      });

      // OpenStreetMap Tiles (Free, No API Key Required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ResQNet Maps',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center if requested
  useEffect(() => {
    if (mapInstanceRef.current && center && center[0] && center[1]) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center]);

  // Render Markers & Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (routeLayerRef.current) routeLayerRef.current.clearLayers();

    const bounds = [];

    // 1. User Location Pin
    if (userLocation && userLocation[0] && userLocation[1]) {
      bounds.push(userLocation);
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-black">
            📍
          </div>
        </div>
      `;
      const userMarker = L.marker(userLocation, {
        icon: createDivIcon(userHtml, '', [32, 32], [16, 16]),
      });
      userMarker.bindPopup(`
        <div class="p-2 text-slate-800 font-sans text-xs">
          <span class="font-extrabold text-blue-600 block text-xs">Your Current Location</span>
          <span class="text-[11px] text-slate-500 font-medium">GPS: ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}</span>
        </div>
      `);
      markersLayerRef.current.addLayer(userMarker);
    }

    // 2. Incident Location Pin
    if (incidentLocation && incidentLocation.latitude && incidentLocation.longitude) {
      const pos = [incidentLocation.latitude, incidentLocation.longitude];
      bounds.push(pos);
      const incHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-rose-500/30 animate-ping"></div>
          <div class="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-sm">
            🚨
          </div>
        </div>
      `;
      const incMarker = L.marker(pos, {
        icon: createDivIcon(incHtml, '', [36, 36], [18, 18]),
      });
      incMarker.bindPopup(`
        <div class="p-2 text-slate-800 font-sans text-xs space-y-1">
          <span class="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-black uppercase">Emergency Scene</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-1">${incidentLocation.title || 'Reported Incident'}</h4>
          <p class="text-[11px] text-slate-500 font-medium">${incidentLocation.address || 'Reported incident location'}</p>
        </div>
      `);
      markersLayerRef.current.addLayer(incMarker);
    }

    // 3. Assigned Rescue Team Moving Pin
    if (assignedTeamLocation && assignedTeamLocation.latitude && assignedTeamLocation.longitude) {
      const pos = [assignedTeamLocation.latitude, assignedTeamLocation.longitude];
      bounds.push(pos);
      const teamHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-9 h-9 rounded-2xl bg-[#237737] text-white flex items-center justify-center shadow-xl border-2 border-white text-sm font-black">
            🚑
          </div>
        </div>
      `;
      const assignedMarker = L.marker(pos, {
        icon: createDivIcon(teamHtml, '', [36, 36], [18, 18]),
      });
      assignedMarker.bindPopup(`
        <div class="p-2 text-slate-800 font-sans text-xs space-y-1">
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black uppercase">Assigned Unit</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-1">${assignedTeamLocation.title || 'Rescue Team'}</h4>
          <p class="text-[11px] text-slate-500 font-semibold">${assignedTeamLocation.vehicle || 'Rescue Vehicle'}</p>
        </div>
      `);
      markersLayerRef.current.addLayer(assignedMarker);
    }

    // 4. Destination Shelter Pin
    if (destinationShelterLocation && destinationShelterLocation.latitude && destinationShelterLocation.longitude) {
      const pos = [destinationShelterLocation.latitude, destinationShelterLocation.longitude];
      bounds.push(pos);
      const shelterHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white text-sm font-black">
            🏥
          </div>
        </div>
      `;
      const destMarker = L.marker(pos, {
        icon: createDivIcon(shelterHtml, '', [36, 36], [18, 18]),
      });
      destMarker.bindPopup(`
        <div class="p-2 text-slate-800 font-sans text-xs space-y-1">
          <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-black uppercase">Destination Shelter</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-1">${destinationShelterLocation.title || 'Shelter Facility'}</h4>
        </div>
      `);
      markersLayerRef.current.addLayer(destMarker);
    }

    // 5. Draw Route Polylines if live tracking
    if (showRoutePolyline && routeLayerRef.current) {
      const polylinePoints = [];
      if (assignedTeamLocation?.latitude && assignedTeamLocation?.longitude) {
        polylinePoints.push([assignedTeamLocation.latitude, assignedTeamLocation.longitude]);
      }
      if (incidentLocation?.latitude && incidentLocation?.longitude) {
        polylinePoints.push([incidentLocation.latitude, incidentLocation.longitude]);
      }
      if (destinationShelterLocation?.latitude && destinationShelterLocation?.longitude) {
        polylinePoints.push([destinationShelterLocation.latitude, destinationShelterLocation.longitude]);
      }

      if (polylinePoints.length >= 2) {
        const line = L.polyline(polylinePoints, {
          color: '#237737',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        });
        routeLayerRef.current.addLayer(line);
      }
    }

    // Extract any rescueTeams and shelters from markers if passed
    const teamMarkers = (markers || [])
      .filter((m) => m.type === 'RESCUE_TEAM' || m.type === 'team')
      .map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude,
        teamName: m.name,
        rescueTeamNumber: m.teamNumber,
        vehicleType: m.vehicleType,
        operatingDistrict: m.district,
        contactPhone: m.phone,
        availability: m.availability || 'Available',
        ...m,
      }));

    const shelterMarkers = (markers || [])
      .filter((m) => m.type === 'SHELTER' || m.type === 'shelter')
      .map((m) => ({
        latitude: m.latitude,
        longitude: m.longitude,
        shelterName: m.name,
        district: m.district,
        shelterPhoneNumber: m.phone,
        shelterStatus: m.shelterStatus || m.status || 'OPEN',
        availableSpots: m.availableCages !== undefined ? m.availableCages : m.availableSpots,
        ...m,
      }));

    const allRescueTeams = [...rescueTeams, ...teamMarkers];
    const allShelters = [...shelters, ...shelterMarkers];

    // 6. Rescue Teams Pins
    if (filterMode === 'all' || filterMode === 'teams') {
      allRescueTeams.forEach((team) => {
        const lat = team.latitude;
        const lon = team.longitude;
        if (!lat || !lon) return;

        bounds.push([lat, lon]);
        const isAvail = team.availability === 'Available';
        const teamHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-2xl ${
              isAvail ? 'bg-amber-600' : 'bg-slate-600'
            } text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-black">
              🚑
            </div>
            <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${
              isAvail ? 'bg-emerald-500' : 'bg-amber-500'
            } border-2 border-white"></div>
          </div>
        `;
        const marker = L.marker([lat, lon], {
          icon: createDivIcon(teamHtml, '', [32, 32], [16, 16]),
        });

        marker.bindPopup(`
          <div class="p-2.5 text-slate-800 font-sans text-xs space-y-1.5 min-w-[200px]">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black uppercase">Rescue Squad</span>
              <span class="text-[10px] font-bold ${isAvail ? 'text-emerald-700' : 'text-slate-500'}">${team.availability || 'Available'}</span>
            </div>
            <h4 class="font-extrabold text-slate-900 text-sm">${team.teamName || team.rescueTeamNumber}</h4>
            <p class="text-[11px] text-slate-500 font-medium">Vehicle: <strong>${team.vehicleType || 'Ambulance'}</strong> (${team.vehicleNumber || 'Reg'})</p>
            <p class="text-[11px] text-slate-500 font-medium">District: <strong>${team.operatingDistrict || team.district || 'Kerala'}</strong></p>
            ${
              team.contactPhone
                ? `<a href="tel:${team.contactPhone}" class="inline-flex items-center gap-1 mt-1 text-xs font-bold text-[#237737] hover:underline">📞 ${team.contactPhone}</a>`
                : ''
            }
          </div>
        `);

        if (onSelectMarker) {
          marker.on('click', () => onSelectMarker({ type: 'team', data: team }));
        }

        markersLayerRef.current.addLayer(marker);
      });
    }

    // 7. Shelters Pins
    if (filterMode === 'all' || filterMode === 'shelters') {
      allShelters.forEach((shelter) => {
        const lat = shelter.latitude;
        const lon = shelter.longitude;
        if (!lat || !lon) return;

        bounds.push([lat, lon]);
        const isOpen = (shelter.shelterStatus || shelter.currentStatus || 'OPEN') === 'OPEN';
        const shelterHtml = `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-2xl ${
              isOpen ? 'bg-emerald-600' : 'bg-rose-600'
            } text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-black">
              🏠
            </div>
          </div>
        `;
        const marker = L.marker([lat, lon], {
          icon: createDivIcon(shelterHtml, '', [32, 32], [16, 16]),
        });

        marker.bindPopup(`
          <div class="p-2.5 text-slate-800 font-sans text-xs space-y-1.5 min-w-[210px]">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 ${isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} rounded-md text-[10px] font-black uppercase">Shelter</span>
              <span class="text-[10px] font-bold ${isOpen ? 'text-emerald-700' : 'text-rose-700'}">${shelter.shelterStatus || 'OPEN'}</span>
            </div>
            <h4 class="font-extrabold text-slate-900 text-sm">${shelter.shelterName}</h4>
            <p class="text-[11px] text-slate-500 font-medium">Spots Available: <strong class="${shelter.availableSpots > 0 ? 'text-emerald-600' : 'text-rose-600'}">${shelter.availableSpots ?? 'Configured'}</strong></p>
            ${
              shelter.shelterPhoneNumber
                ? `<a href="tel:${shelter.shelterPhoneNumber}" class="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700 hover:underline">📞 ${shelter.shelterPhoneNumber}</a>`
                : ''
            }
          </div>
        `);

        if (onSelectMarker) {
          marker.on('click', () => onSelectMarker({ type: 'shelter', data: shelter }));
        }

        markersLayerRef.current.addLayer(marker);
      });
    }

    // Auto-fit bounds if multiple points
    if (bounds.length > 1 && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (err) {
        console.warn('Map fitBounds err:', err);
      }
    }
  }, [
    rescueTeams,
    shelters,
    markers,
    userLocation,
    incidentLocation,
    assignedTeamLocation,
    destinationShelterLocation,
    showRoutePolyline,
    filterMode,
  ]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm z-0">
      <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-0" />
    </div>
  );
};

export default InteractiveMap;
