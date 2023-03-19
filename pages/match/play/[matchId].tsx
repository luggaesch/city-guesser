import {GetServerSideProps} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";
import Match from "../../../type/match";
import Overview from "../../../features/overview";

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})) }
    }
}

export default function PlayMatch({ match }: { match: Match }) {

    return (
        <Overview initialMatch={match} />
    )
}