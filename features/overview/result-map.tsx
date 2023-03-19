import {getBboxForPoints, getBoundsZoomLevel, getCenter} from "../../lib/geo";
import {MapStyles} from "../../lib/mapbox";
import {Layer, Map, Marker, Source, useMap} from "react-map-gl";
import {default as distance} from "@turf/distance";
import {Team} from "../../type/match";
import {useEffect, useMemo} from "react";
import Place from "../../type/place";
import styles from "./overview.module.css";
import {Button} from "@mui/material";

export default function ResultMap({ place, teams, onContinue }: { place: Place, teams: Team[], onContinue?: () => void }) {
    const {map} = useMap();
    const answers = useMemo(() => {
        return teams.map((t) => ({ team: t, position: t.selectedCoordinates.find((input) => String(input.placeId) === String(place._id))! }))
    }, [teams, place]);
    const viewPort = useMemo(() => {
        const points = [ [place.lng, place.lat], ...answers.map((a) => [a.position.lng, a.position.lat] ) ];
        const c = getCenter(points);
        return {
            longitude: c[0],
            latitude: c[1],
            zoom: getBoundsZoomLevel(getBboxForPoints(points)) - 1
        }
    }, [place, answers]);
    
    useEffect(() => {
        if (!map) return;
        const points = [ [place.lng, place.lat], ...answers.map((a) => [a.position.lng, a.position.lat] ) ];
        const c = getCenter(points);
        map.fitBounds({ lng: c[0], lat: c[1] });
        map.setZoom(getBoundsZoomLevel(getBboxForPoints(points)) - 1);
    }, [answers, map, place]);

    return (
        <div className={styles.resultMapContainer}>
            <Map initialViewState={viewPort} mapStyle={MapStyles.Label} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
                {answers.map(({position, team}, index) => {
                    const sortedAnswers = [...answers].sort((a, b) => {
                            const deltaA = distance([place.lng, place.lat], [a.position.lng, a.position.lat]),
                                deltaB = distance([place.lng, place.lat], [b.position.lng, b.position.lat]);
                            if (deltaA > deltaB) {
                                return 1
                            } else if (deltaA < deltaB) {
                                return -1;
                            }
                            return 0;
                        });
                    return (
                        <>
                            <Marker key={team._id} longitude={position.lng} latitude={position.lat}>
                                <div style={{ backgroundColor: "#ffffff80", width: 100, textAlign: "center", padding: 10, borderRadius: 12, display: "flex", flexDirection: "column" }}>
                                    <p>{team.name}</p>
                                    <p>{distance([position.lng, position.lat],
                                        [place.lng, place.lat]
                                    ).toFixed(2)} km</p>
                                </div>
                            </Marker>
                            <Source id={team._id!} type="geojson"
                                    data={{
                                        type: "Feature",
                                        properties: {},
                                        geometry: {
                                            type: "LineString",
                                            coordinates: [[position.lng, position.lat], [place.lng, place.lat]]
                                        }
                                    }}>
                                <Layer type="line"
                                       id={team._id!}
                                       layout={{ "line-join": "round", "line-cap": "round" }}
                                       paint={{
                                           "line-color": team._id === sortedAnswers[0].team._id ? "#00ff00" : "#ff0000",
                                           "line-width": 2
                                       }}
                                />
                            </Source>
                        </>
                    )
                })}
                <Marker color={"#ff0000"} longitude={place.lng} latitude={place.lat} />
                {onContinue && <Button onClick={onContinue} variant="contained" className={styles.continue}>
                    Next Place
                </Button>}
            </Map>
        </div>
    )
}