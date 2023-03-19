import {useState} from "react";
import Map, {MapLayerMouseEvent, Marker} from "react-map-gl";
import axios from "axios";
import {IconButton} from "@mui/material";
import {Check, ChevronRight, Done} from "@mui/icons-material";
import {MapStyles} from "../../lib/mapbox";
import Match from "../../type/match";
import Loading from "../../components/loading";
import styles from "./pinpoint.module.css";

export default function PinPoint({ match, teamId }: { match: Match, teamId: string }) {
    const [clickedCoordinates, setClickedCoordinates] = useState<([number, number] | null)[]>(match.places.map(() => null));
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    function handleClick(event: MapLayerMouseEvent) {
        const selections = [...clickedCoordinates];
        selections[currentPlaceIndex] = [event.lngLat.lng, event.lngLat.lat];
        setClickedCoordinates(selections);
    }

    function handleDone() {
        setLoading(true);
        axios.post("/api/match/setCoordinates", { matchId: match._id, teamId, points: clickedCoordinates }).then((res) => {
            setLoading(false);
            setDone(true);
            console.log(res)
        });
    }

    return (
        <div className={styles.pinpointContainer}>
            <Map initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }} onClick={handleClick} mapStyle={MapStyles.NoLabel} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
                {/*
                    TODO: Make this optional
                    <p>Try to Pinpoint: {match.places[currentPlaceIndex].name}</p>*/
                }
                {clickedCoordinates[currentPlaceIndex] !== null && <Marker longitude={clickedCoordinates[currentPlaceIndex]![0]} latitude={clickedCoordinates[currentPlaceIndex]![1]} />}
                {clickedCoordinates[currentPlaceIndex] !== null && (currentPlaceIndex !== match.places.length - 1 ?
                        <IconButton onClick={() => setCurrentPlaceIndex(currentPlaceIndex + 1)} className={styles.iconButton}>
                            <ChevronRight />
                        </IconButton>
                        : <IconButton onClick={() => handleDone()} className={styles.iconButton}>
                            <Done />
                        </IconButton>
                )}
            </Map>
            {loading && <Loading />}
            {done && <div className={styles.done} onClick={() => setDone(false)}>
                <div>
                    <Check />
                </div>
            </div>}
        </div>
    )
}