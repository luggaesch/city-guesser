import {GetServerSideProps} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";
import Match from "../../../type/match";
import {Line} from "rc-progress";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";
import {Button, IconButton} from "@mui/material";
import {MapOutlined} from "@mui/icons-material";
import {default as distance} from "@turf/distance";
import {Layer, Map, Marker, Source, useMap} from "react-map-gl";
import {MapStyles} from "./[matchId]/[teamId]";
import QRCode from "react-qr-code";
import {getBboxForPoints, getBoundsZoomLevel} from "../../../lib/geo";
import Feature from "../../../type/feature";

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})) }
    }
}

export default function PlayMatch({ match }: { match: Match }) {
    const [currentMatch, setCurrentMatch] = useState(match);
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const [showMap, setShowMap] = useState(false);
    useEffect(() => {
        setInterval(() => {
            axios.get("/api/match/fetchById/" + match._id).then((res) => {
                setCurrentMatch(res.data as Match);
            })
        }, 1000);
    }, [match]);

    function getLink(teamId: string) {
        let host;
        if (process.env.NEXT_PUBLIC_IP_ADDR){
            host = `http://${process.env.NEXT_PUBLIC_IP_ADDR}:3000`
        } else if (location) {
            host = location.origin;
        } else {
            host = "https://woliegtwas.herokuapp.com";
        }
        return `${host}/match/play/${match._id}/${currentMatch._id}/${teamId}`;
    }

    return (
        <>
            {!showMap &&
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <ul>
                {currentMatch.teams.map((team) => (
                    <li key={team._id}>
                        <Link target="_blank" href={getLink(team._id!)}>
                            <QRCode value={getLink(team._id!)} />
                        </Link>
                        {/*
                        <Link target="_blank" href={`/match/play/${currentMatch._id}/${team._id}`}>
                            Click here for team {team.name}
                        </Link>
                        */}
                    </li>
                ))}
            </ul>
                    <Line style={{ width: 300 }} percent={currentMatch.teams.filter((t) => t.selectedCoordinates !== undefined).length / currentMatch.teams.length * 100} strokeWidth={4} trailWidth={4} strokeColor={"#00ff00"} />
            <IconButton style={{ color: "white" }} onClick={() => setShowMap(!showMap)}>
                <MapOutlined />
            </IconButton>
        </div>
            }
            {showMap && <Map initialViewState={{ longitude: currentMatch.features[0].lng, latitude: currentMatch.features[0].lat, zoom: getBoundsZoomLevel(getBboxForPoints([[[match.features[currentPlaceIndex].lng, match.features[currentPlaceIndex].lat], match.teams.map((t) => [t.selectedCoordinates[currentPlaceIndex].lng, t.selectedCoordinates[currentPlaceIndex].lat] )].flat(2)])) }} mapStyle={MapStyles.Label} style={{ zIndex: 5, width: "100vw", height: "100vh", position: "fixed", left: 0, top: 0}} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
                {currentMatch.teams.map((t) => (
                    <>
                        <Marker key={t._id} longitude={t.selectedCoordinates[currentPlaceIndex].lng} latitude={t.selectedCoordinates[currentPlaceIndex].lat}>
                            <div style={{ backgroundColor: "#ffffff80", width: 100, textAlign: "center", padding: 10, borderRadius: 12, display: "flex", flexDirection: "column" }}>
                                <p>{t.name}</p>
                                <p>{distance([t.selectedCoordinates[currentPlaceIndex].lng, t.selectedCoordinates[currentPlaceIndex].lat],
                                    [currentMatch.features[currentPlaceIndex].lng, currentMatch.features[currentPlaceIndex].lat]
                                ).toFixed(2)} km</p>
                            </div>
                        </Marker>
                        <Source id={t._id} type="geojson"
                                data={{
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "LineString",
                                        coordinates: [[t.selectedCoordinates[currentPlaceIndex].lng, t.selectedCoordinates[currentPlaceIndex].lat], [currentMatch.features[currentPlaceIndex].lng, currentMatch.features[currentPlaceIndex].lat]]
                                    }
                                }}>
                            <Layer type="line"
                                   id={t._id}
                                   layout={{ "line-join": "round", "line-cap": "round" }}
                                   paint={{
                                       "line-color": currentMatch.teams.map((team) => ({ id: team._id, distance: distance([t.selectedCoordinates[currentPlaceIndex].lng, t.selectedCoordinates[currentPlaceIndex].lat],
                                           [currentMatch.features[currentPlaceIndex].lng, currentMatch.features[currentPlaceIndex].lat]
                                       )})).sort((a, b) => {
                                           if (a.distance < b.distance) return -1;
                                           if (a.distance > b.distance) return 1;
                                           return 0;
                                       })[0].id === t._id ? "#00ff00" : "#ff0000",
                                       "line-width": 2
                                   }}
                            />
                        </Source>

                    </>
                ))}
                <Marker color={"#ff0000"} longitude={currentMatch.features[currentPlaceIndex].lng} latitude={currentMatch.features[currentPlaceIndex].lat} />
                <ContinueButton match={currentMatch} currentPlaceIndex={currentPlaceIndex} setPlaceIndex={setCurrentPlaceIndex} />
            </Map>}
        </>
    )
}

function ContinueButton({ match, currentPlaceIndex, setPlaceIndex }: { match: Match, currentPlaceIndex: number, setPlaceIndex: Dispatch<SetStateAction<number>> }) {
    const {map} = useMap();

    if (currentPlaceIndex === match.features.length - 1) {
        return <></>
    }

    return (
        <Button onClick={() => {
            const nextIndex = currentPlaceIndex + 1;
            map?.fitBounds({ lng: match.features[nextIndex].lng, lat: match.features[nextIndex].lat });
            map?.setZoom(getBoundsZoomLevel(getBboxForPoints([[[match.features[nextIndex].lng, match.features[nextIndex].lat], match.teams.map((t) => [t.selectedCoordinates[nextIndex].lng, t.selectedCoordinates[nextIndex].lat] )].flat(2)])));
            setPlaceIndex(nextIndex);
        }} variant="contained" style={{ position: "absolute", left: 10, bottom: 10  }}>
            Next Place
        </Button>
    )
}