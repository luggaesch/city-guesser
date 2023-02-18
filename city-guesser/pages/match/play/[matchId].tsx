import {GetServerSideProps} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";
import Match from "../../../type/match";
import {Line} from "rc-progress";
import {useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";
import {IconButton} from "@mui/material";
import {MapOutlined} from "@mui/icons-material";
import {default as distance} from "@turf/distance";
import {Layer, Map, Marker, Source} from "react-map-gl";
import {MapStyles} from "./[matchId]/[teamId]";
import QRCode from "react-qr-code";

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})) }
    }
}

export default function PlayMatch({ match }: { match: Match }) {
    const [currentMatch, setCurrentMatch] = useState(match);
    const [showMap, setShowMap] = useState(false);
    useEffect(() => {
        setInterval(() => {
            axios.get("/api/match/fetchById/" + match._id).then((res) => {
                setCurrentMatch(res.data as Match);
            })
        }, 1000);
    }, [match]);

    return (
        <>
            {!showMap &&
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <ul>
                {currentMatch.teams.map((team) => (
                    <li key={team._id}>
                        <QRCode value={`http://192.168.178.25:3000/match/play/${currentMatch._id}/${team._id}`} />
                        {/*
                        <Link target="_blank" href={`/match/play/${currentMatch._id}/${team._id}`}>
                            Click here for team {team.name}
                        </Link>
                        */}
                    </li>
                ))}
            </ul>
                    <Line style={{ width: 300 }} percent={currentMatch.teams.filter((t) => t.selectedCoordinates !== undefined).length / currentMatch.teams.length * 100} strokeWidth={4} trailWidth={4} strokeColor={"#00ff00"} />
            <IconButton onClick={() => setShowMap(!showMap)}>
                <MapOutlined />
            </IconButton>
        </div>
            }
            {showMap && <Map mapStyle={MapStyles.Label.url} style={{ zIndex: 5, width: "100vw", height: "100vh", position: "fixed", left: 0, top: 0}} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
                {currentMatch.teams.map((t) => (
                    <>
                        <Marker key={t._id} longitude={t.selectedCoordinates.lng} latitude={t.selectedCoordinates.lat}>
                            <div style={{ backgroundColor: "#ffffff80", width: 100, textAlign: "center", padding: 10, borderRadius: 12, display: "flex", flexDirection: "column" }}>
                                <p>{t.name}</p>
                                <p>{distance([t.selectedCoordinates.lng, t.selectedCoordinates.lat],
                                    [currentMatch.features[0].lng, currentMatch.features[0].lat]
                                ).toFixed(2)} km</p>
                            </div>
                        </Marker>
                        <Source id={t._id} type="geojson"
                                data={{
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "LineString",
                                        coordinates: [[t.selectedCoordinates.lng, t.selectedCoordinates.lat], [currentMatch.features[0].lng, currentMatch.features[0].lat]]
                                    }
                                }}>
                            <Layer type="line"
                                   id={t._id}
                                   layout={{ "line-join": "round", "line-cap": "round" }}
                                   paint={{
                                       "line-color": currentMatch.teams.map((team) => ({ id: team._id, distance: distance([team.selectedCoordinates.lng, team.selectedCoordinates.lat],
                                           [currentMatch.features[0].lng, currentMatch.features[0].lat]
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
                <Marker color={"#ff0000"} longitude={currentMatch.features[0].lng} latitude={currentMatch.features[0].lat} />
            </Map>}
        </>
    )
}
