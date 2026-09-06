import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue } from '../types';

interface MapComponentProps {
  issues?: Issue[];
  selectedIssueId?: string | null;
  onSelectIssue?: (issue: Issue) => void;
  onNavigateToDetails?: (issueId: string) => void;
  pickerMode?: boolean;
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (loc: { lat: number; lng: number }) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Default center: India (New Delhi / NCR)
const DEFAULT_INDIA_CENTER: [number, number] = [28.6139, 77.2090];

export const MapComponent: React.FC<MapComponentProps> = ({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  onNavigateToDetails,
  pickerMode = false,
  selectedLocation,
  onLocationSelect,
  center = DEFAULT_INDIA_CENTER,
  zoom = 12,
  className = 'h-[500px] w-full rounded-2xl overflow-hidden',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const pickerModeRef = useRef(pickerMode);
  pickerModeRef.current = pickerMode;

  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;

  const onNavigateToDetailsRef = useRef(onNavigateToDetails);
  onNavigateToDetailsRef.current = onNavigateToDetails;

  const onSelectIssueRef = useRef(onSelectIssue);
  onSelectIssueRef.current = onSelectIssue;

  // Helper to create custom SVG icon for pins
  const createMarkerIcon = (issue: Issue, isSelected: boolean) => {
    let pinColor = '#f59e0b'; // amber (In Progress / Reported)
    let strokeColor = '#b45309';

    if (issue.status === 'Resolved') {
      pinColor = '#10b981'; // emerald
      strokeColor = '#047857';
    } else if (issue.ai_severity === 'High') {
      pinColor = '#ef4444'; // red
      strokeColor = '#b91c1c';
    } else if (issue.ai_severity === 'Low') {
      pinColor = '#059669'; // dark green
      strokeColor = '#047857';
    }

    const size = isSelected ? 42 : 34;
    const ring = isSelected ? 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.9))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))';

    const svgHtml = `
      <div style="filter: ${ring}; transform: translate(-50%, -100%); width: ${size}px; height: ${size}px; cursor: pointer; transition: transform 0.2s;">
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${pinColor}" stroke="#ffffff" stroke-width="1.5">
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 14 1-1 8-8.75 8-14 0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-civic-pin',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  const createPickerIcon = () => {
    const svgHtml = `
      <div style="filter: drop-shadow(0 4px 10px rgba(15, 23, 42, 0.4)); transform: translate(-50%, -100%); width: 44px; height: 44px; cursor: grab;">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="#0f172a" stroke="#2563eb" stroke-width="2">
          <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 14 1-1 8-8.75 8-14 0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-picker-pin',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  // Initialize Map with Leaflet & OpenStreetMap tiles
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [center[0], center[1]],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
      });

      // User requested exact OpenStreetMap tile template with proper attribution
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapRef.current = map;

      // Handle map clicks in location picker mode
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (pickerModeRef.current && onLocationSelectRef.current) {
          onLocationSelectRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      // Ensure proper tile sizing after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    // ResizeObserver to handle fluid layout or tab shifts
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when center or zoom props change manually
  useEffect(() => {
    if (mapRef.current && center && !pickerMode) {
      mapRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Handle Location Picker marker updates
  useEffect(() => {
    if (!mapRef.current || !pickerMode) return;

    if (selectedLocation) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      } else {
        const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: createPickerIcon(),
          draggable: true,
        }).addTo(mapRef.current);

        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          if (onLocationSelectRef.current) {
            onLocationSelectRef.current({ lat: latLng.lat, lng: latLng.lng });
          }
        });

        pickerMarkerRef.current = marker;
      }
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 14, { animate: true });
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [pickerMode, selectedLocation?.lat, selectedLocation?.lng]);

  // Handle Issues markers updates & automatic bounds fitting on category/filter change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || pickerMode) return;

    markersLayerRef.current.clearLayers();

    let selectedMarker: L.Marker | null = null;

    issues.forEach((issue) => {
      const isSelected = issue.id === selectedIssueId;
      const marker = L.marker([issue.latitude, issue.longitude], {
        icon: createMarkerIcon(issue, isSelected),
        title: issue.title,
      });

      marker.on('click', () => {
        if (onSelectIssueRef.current) {
          onSelectIssueRef.current(issue);
        }
      });

      // Bind interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'civic-popup p-1 max-w-xs';
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${
            issue.image_url
              ? `<img src="${issue.image_url}" alt="${issue.title}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px; cursor: pointer;" id="popup-img-${issue.id}" />`
              : ''
          }
          <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;">
            ${issue.category}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.3; margin-bottom: 4px; cursor: pointer;" id="popup-title-${issue.id}">
            ${issue.title}
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${issue.ai_summary || issue.description}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-bottom: 8px;">
            <span style="font-weight: 600; color: ${issue.status === 'Resolved' ? '#16a34a' : '#d97706'};">
              ● ${issue.status}
            </span>
            <span style="font-weight: 600; color: #1e293b;">
              ▲ ${issue.upvote_count} Upvotes
            </span>
          </div>
          <button id="popup-btn-${issue.id}" style="width: 100%; padding: 6px 10px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background-color 0.15s;">
            <span>View Issue Details</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      // Attach click listener to button and title inside the popup
      setTimeout(() => {
        const btn = popupContent.querySelector(`#popup-btn-${issue.id}`);
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onNavigateToDetailsRef.current) {
              onNavigateToDetailsRef.current(issue.id);
            } else if (onSelectIssueRef.current) {
              onSelectIssueRef.current(issue);
            }
          });
        }
        const titleEl = popupContent.querySelector(`#popup-title-${issue.id}`);
        if (titleEl) {
          titleEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onNavigateToDetailsRef.current) {
              onNavigateToDetailsRef.current(issue.id);
            } else if (onSelectIssueRef.current) {
              onSelectIssueRef.current(issue);
            }
          });
        }
      }, 0);

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);

      if (isSelected) {
        selectedMarker = marker;
      }
    });

    if (selectedMarker) {
      (selectedMarker as L.Marker).openPopup();
    }

    // Dynamic map view adjustment when issues change (e.g. on filter change)
    if (issues.length === 1) {
      mapRef.current.setView([issues[0].latitude, issues[0].longitude], 14, { animate: true });
    } else if (issues.length > 1) {
      const bounds = L.latLngBounds(issues.map((i) => [i.latitude, i.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
    }
  }, [issues, selectedIssueId, pickerMode]);

  return (
    <div className={`relative ${className} border border-slate-200 dark:border-slate-800 shadow-sm z-10 bg-slate-100 dark:bg-slate-900`}>
      <div ref={containerRef} className="w-full h-full" />
      {pickerMode && (
        <div className="absolute top-3 left-12 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>Click anywhere on OpenStreetMap to pin problem location</span>
        </div>
      )}
      {!pickerMode && issues.length === 0 && (
        <div className="absolute inset-0 z-[400] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-center max-w-sm pointer-events-auto">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">No issues in this category</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Try selecting another category or clear your filters above.</p>
          </div>
        </div>
      )}
    </div>
  );
};
