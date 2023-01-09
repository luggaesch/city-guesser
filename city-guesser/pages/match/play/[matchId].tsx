import {GetServerSideProps} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";
import Match from "../../../type/match";
import {Line} from "rc-progress";
import {useEffect, useState} from "react";
import axios from "axios";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})) }
    }
}

export default function PlayMatch({ match }: { match: Match }) {
    const [currentMatch, setCurrentMatch] = useState(match);
    useEffect(() => {
        setInterval(() => {
            axios.get("/api/match/fetchById/" + match._id).then((res) => {
                setCurrentMatch(res.data as Match);
            })
        }, 1000);
    }, [match]);

    return (
        <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <ul>
                {match.teams.map((team) => (
                    <li key={team._id}>
                        <Link target="_blank" href={`/match/play/${match._id}/${team._id}`}>
                            Click here for team {team.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <Line style={{ width: 300 }} percent={currentMatch.teams.filter((t) => t.selectedCoordinates !== undefined).length / currentMatch.teams.length * 100} strokeWidth={4} trailWidth={4} strokeColor={"#00ff00"} />
        </div>
    )
}
