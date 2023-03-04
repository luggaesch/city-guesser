import Map, {MapLayerMouseEvent, Marker} from "react-map-gl";
import axios from "axios";
import {GetServerSideProps} from "next";
import connectMongo from "../../../../lib/connect-mongo";
import MatchModel from "../../../../lib/schemas/match";
import Match from "../../../../type/match";
import {useState} from "react";
import {IconButton} from "@mui/material";
import {ChevronRight, Done} from "@mui/icons-material";

const prefix = "mapbox://styles";
const mapboxDomain = "mapbox";

export type MapboxStyleFormat = {
    url: string;
    previewImage: string;
    name: string;
}

export const MapStyles = {
    NoLabel: `${prefix}/roflcopta123/cletuhqoz00a201o859pd3guo`,
    Label: `${prefix}/${mapboxDomain}/dark-v10`,
    Satellite: `mapbox://styles/mapbox/satellite-v9`
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})), teamId: context.query.teamId }
    }
}

export default function SelectCoordinates({ match, teamId }: { match: Match, teamId: string }) {
    const [clickedCoordinates, setClickedCoordinates] = useState<([number, number] | null)[]>(match.features.map(() => null));
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);

    function handleClick(event: MapLayerMouseEvent) {
        const selections = [...clickedCoordinates];
        selections[currentPlaceIndex] = [event.lngLat.lng, event.lngLat.lat];
        setClickedCoordinates(selections);
    }

    function handleDone() {
        axios.post("/api/match/setCoordinates", { matchId: match._id, teamId, points: clickedCoordinates }).then((res) => console.log(res));
    }

    return (
        <Map initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }} onClick={handleClick} mapStyle={MapStyles.NoLabel} style={{ width: "100vw", height: "100vh" }} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
            <div style={{ padding: 10, position: "fixed", left: 10, top: 10, width: 200, textAlign: "center", borderRadius: 4, backgroundColor: "#ffffff80" }}>Try to Pinpoint: {match.features[currentPlaceIndex].name}</div>
            {clickedCoordinates[currentPlaceIndex] !== null && <Marker longitude={clickedCoordinates[currentPlaceIndex]![0]} latitude={clickedCoordinates[currentPlaceIndex]![1]} />}
            {clickedCoordinates[currentPlaceIndex] !== null && (currentPlaceIndex !== match.features.length - 1 ?
                <IconButton onClick={() => setCurrentPlaceIndex(currentPlaceIndex + 1)} style={{ position: "fixed", right: 10, bottom: 30, background: "#bbb", color: "#111" }}>
                    <ChevronRight />
                </IconButton>
            : <IconButton onClick={() => handleDone()} style={{ position: "fixed", right: 10, bottom: 30, background: "#bbb", color: "#111" }}>
                    <Done />
                </IconButton>
            )}
        </Map>
    )
}
