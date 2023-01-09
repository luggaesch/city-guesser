import Map, {MapLayerMouseEvent} from "react-map-gl";
import axios from "axios";
import {GetServerSideProps} from "next";
import connectMongo from "../../../../lib/connect-mongo";
import MatchModel from "../../../../lib/schemas/match";

const prefix = "mapbox://styles";
const mapboxDomain = "mapbox";
const rbitechDomain = "rbitechug";

export type MapboxStyleFormat = {
    url: string;
    previewImage: string;
    name: string;
}

export const MapStyles = {
    Dark: { url: `${prefix}/${mapboxDomain}/dark-v10`, previewImage:  "/images/styles/dark.PNG", name: "Dark"},
    Forest: { url: `${prefix}/${rbitechDomain}/cjzfjuhz30nmp1cqlqfsgmmb4`, previewImage: "/images/styles/forest.PNG", name: "Forest" },
    Satellite: { url: `${prefix}/${rbitechDomain}/ck71s4ot50ov81iophswcq2xg` , previewImage: "/images/styles/satellite.PNG", name: "Satellite" },
    Outdoor: { url: `${prefix}/${rbitechDomain}/cjzfjv1iw0r1f1cn56s7s8ks0`, previewImage: "/images/styles/outdoor.PNG", name: "Outdoor" },
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: context.query
    }
}

export default function SelectCoordinates({ matchId, teamId }: { matchId: string, teamId: string }) {

    function handleClick(event: MapLayerMouseEvent) {
        axios.post("/api/match/setCoordinates", { matchId, teamId, lng: event.lngLat.lng, lat: event.lngLat.lat }).then((res) => console.log(res));
    }

    return (
        <Map onClick={handleClick} mapStyle={MapStyles.Dark.url} style={{ width: "100vw", height: "100vh" }} mapboxAccessToken={"pk.eyJ1IjoicmJpdGVjaHVnIiwiYSI6ImNra2NiZjh4YjBndXYyb283cWRnMmVydzEifQ.0ouijbCtGi7-2_8Kz7iw3w"} />
    )
}
