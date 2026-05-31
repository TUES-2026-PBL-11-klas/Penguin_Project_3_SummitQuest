import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LatLng } from '../data/types';
import { colors, radius } from '../theme';

export type MarkerKind = 'start' | 'end' | 'user' | 'stop' | 'flag';

export interface MapRoute {
  coords: LatLng[];
  color: string;
  dashed?: boolean;
}

export interface MapMarker {
  coord: LatLng;
  kind: MarkerKind;
  label?: string;
}

interface LeafletMapProps {
  routes?: MapRoute[];
  markers?: MapMarker[];
  /** Points the map must keep in view. Defaults to all route + marker points. */
  fitTo?: LatLng[];
  interactive?: boolean;
  height?: number;
  style?: ViewStyle;
}

const PIN_STYLES: Record<MarkerKind, { bg: string; glyph: string; ring: string }> = {
  start: { bg: '#2F6B4F', glyph: '▲', ring: '#E6EFE9' },
  end: { bg: '#B4543C', glyph: '★', ring: '#F6E3DD' },
  user: { bg: '#3D7DDA', glyph: '●', ring: '#E2ECFA' },
  stop: { bg: '#7A604A', glyph: '◼', ring: '#F0E8DF' },
  flag: { bg: '#C9A24B', glyph: '⚑', ring: '#F7EEDA' },
};

function buildHtml(
  routes: MapRoute[],
  markers: MapMarker[],
  fitPoints: LatLng[],
  interactive: boolean,
): string {
  const data = JSON.stringify({ routes, markers, fitPoints, interactive, pins: PIN_STYLES });
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#E8EEE9; }
  .leaflet-container { background:#E8EEE9; font-family: -apple-system, system-ui, sans-serif; }
  .sq-pin {
    display:flex; align-items:center; justify-content:center;
    width:30px; height:30px; border-radius:50%;
    color:#fff; font-size:14px; font-weight:700;
    box-shadow:0 3px 8px rgba(0,0,0,0.28);
  }
  .leaflet-control-attribution { font-size:9px; opacity:0.6; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var D = ${data};
  var map = L.map('map', {
    zoomControl: D.interactive,
    dragging: D.interactive,
    scrollWheelZoom: D.interactive,
    doubleClickZoom: D.interactive,
    touchZoom: D.interactive,
    boxZoom: D.interactive,
    keyboard: D.interactive,
    tap: D.interactive,
    attributionControl: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  D.routes.forEach(function(r){
    if(!r.coords || r.coords.length < 2) return;
    // soft outer casing for depth
    L.polyline(r.coords, { color:'#ffffff', weight:9, opacity:0.9, lineCap:'round', lineJoin:'round' }).addTo(map);
    L.polyline(r.coords, {
      color:r.color, weight:5, opacity:0.95, lineCap:'round', lineJoin:'round',
      dashArray: r.dashed ? '2,9' : null
    }).addTo(map);
  });

  D.markers.forEach(function(m){
    var p = D.pins[m.kind];
    var icon = L.divIcon({
      className:'',
      html:'<div class="sq-pin" style="background:'+p.bg+';border:2px solid '+p.ring+'">'+p.glyph+'</div>',
      iconSize:[30,30], iconAnchor:[15,15]
    });
    var mk = L.marker(m.coord, { icon: icon, interactive: !!m.label }).addTo(map);
    if(m.label){ mk.bindPopup(m.label); }
  });

  var pts = D.fitPoints && D.fitPoints.length ? D.fitPoints : [];
  D.routes.forEach(function(r){ pts = pts.concat(r.coords || []); });
  D.markers.forEach(function(m){ pts.push(m.coord); });
  if(pts.length === 1){
    map.setView(pts[0], 14);
  } else if(pts.length > 1){
    map.fitBounds(L.latLngBounds(pts), { padding:[36,36] });
  } else {
    map.setView([42.66, 23.28], 12);
  }
  setTimeout(function(){ map.invalidateSize(); }, 250);
</script>
</body>
</html>`;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  routes = [],
  markers = [],
  fitTo,
  interactive = false,
  height = 220,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const html = useMemo(
    () => buildHtml(routes, markers, fitTo ?? [], interactive),
    [routes, markers, fitTo, interactive],
  );

  return (
    <View style={[styles.wrap, { height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color={colors.green} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#E8EEE9',
  },
  web: { flex: 1, backgroundColor: '#E8EEE9' },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEE9',
  },
});

export default LeafletMap;
