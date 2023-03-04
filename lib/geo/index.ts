import {LngLatBoundsLike, LngLatLike} from "react-map-gl";
import {polygon as polygon, bbox} from "@turf/turf";

export function lngLatToMapPosition(lngLat: LngLatLike) {
    if (Array.isArray(lngLat)) {
        return { longitude: lngLat[0], latitude: lngLat[1] }
    } else if ("lng" in lngLat) {
        return { longitude: lngLat.lng, latitude: lngLat.lat }
    } else {
        return { longitude: lngLat.lon, latitude: lngLat.lat }
    }
}

function getNorthEastSouthWest(bounds: LngLatBoundsLike) {
    if ("getNorthEast" in bounds) {
        return { ne: bounds.getNorthEast(), sw: bounds.getSouthWest() };
    } else if (Array.isArray(bounds) && bounds.length === 4) {
        return { ne: { lng: bounds[2], lat: bounds[3] }, sw: { lng: bounds[0], lat: bounds[1] } }
    } else if (Array.isArray(bounds) && bounds.length === 2 && typeof(bounds[0]) !== "number") {
        const points = bounds.map((lngLat) => lngLatToMapPosition(lngLat as LngLatLike));
        return { ne: { lng: points[1].longitude, lat: points[1].latitude }, sw: { lng: points[0].longitude, lat: points[0].latitude } }
    } else {
        return null;
    }
}

export function getBoundsZoomLevel(bounds: LngLatBoundsLike) {
    // TODO: dont do this here
    const map = document.querySelector(".mapboxgl-canvas") as HTMLCanvasElement;
    const mapDim = { width: map ? map.width : 1920, height: map ? map.height : 1080};
    const neSw = getNorthEastSouthWest(bounds);
    if (!neSw) return 10;
    const {ne, sw} = neSw;
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;
    function latRad(lat: number) {
        const sin = Math.sin(lat * Math.PI / 180);
        const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }
    function zoom(mapPx: number, worldPx: number, fraction: number) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }
    // @ts-ignore
    const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;
    const lngDiff = ne.lng - sw.lng;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);
    console.log(Math.min(latZoom, lngZoom, ZOOM_MAX));
    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

export function getBboxForPoints(points: number[][]) {
    const ring = [...points];
    while (ring.length < 4) {
        ring.push(ring[0]);
    }
    const p = polygon([ring]);
    return bbox(p) as [number, number, number, number] ;
}