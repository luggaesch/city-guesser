import Match from "../../type/match";
import styles from "./overview.module.css";
import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import ResultMap from "./result-map";
import Link from "next/link";
import QRCode from "react-qr-code";
import {Line} from "rc-progress";
import {IconButton} from "@mui/material";
import {MapOutlined} from "@mui/icons-material";

export default function Overview({ initialMatch }: { initialMatch: Match }) {
    const [match, setMatch] = useState({...initialMatch});
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const [showMap, setShowMap] = useState(false);
    const progress = useMemo(() => {
        return match.teams.filter((t) => t.selectedCoordinates.length > 0).length / match.teams.length * 100
    }, [match.teams]);
    useEffect(() => {
        setInterval(() => {
            axios.get("/api/match/fetchById/" + match._id).then((res) => {
                // TODO: Validate here
                setMatch(res.data as Match);
            })
        }, 1000);
    }, []);

    function getLink(teamId: string) {
        let host;
        if (process.env.NEXT_PUBLIC_IP_ADDR){
            host = `http://${process.env.NEXT_PUBLIC_IP_ADDR}:3000`
        } else {
            host = "https://woliegtwas.herokuapp.com";
        }
        return `${host}/match/play/${match._id}/${teamId}`;
    }

    function onContinue() {
        if (currentPlaceIndex + 1 < match.places.length) {
            setCurrentPlaceIndex(currentPlaceIndex + 1);
        }
    }

    return (
        <div className={styles.overviewContainer}>
            {showMap ?
                <ResultMap place={match.places[currentPlaceIndex]} teams={match.teams} onContinue={currentPlaceIndex + 1 < match.places.length ? onContinue : undefined} />
                :
                <>
                    <ul>
                        {match.teams.map((team) => {
                            return (

                                <li key={team._id} style={team.selectedCoordinates.length === match.places.length ? {backgroundColor: "#52ba52"} : {}}>
                                    <p>{team.name}</p>
                                    <Link target="_blank" href={getLink(team._id!)}>
                                        <QRCode value={getLink(team._id!)} />
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                    <Line style={{ width: "50%", height: 22 }} percent={progress} strokeWidth={4} trailWidth={4} />
                    {progress === 100 && <IconButton style={{ color: "white" }} onClick={() => setShowMap(!showMap)}>
                        <MapOutlined />
                    </IconButton>}
                </>
            }
        </div>
    )
}