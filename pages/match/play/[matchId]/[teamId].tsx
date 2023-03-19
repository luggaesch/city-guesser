import {GetServerSideProps} from "next";
import connectMongo from "../../../../lib/connect-mongo";
import MatchModel from "../../../../lib/schemas/match";
import Match from "../../../../type/match";
import PinPoint from "../../../../features/pinpoint";

export const getServerSideProps: GetServerSideProps = async (context) => {
    await connectMongo;
    const match = await MatchModel.findOne({ _id: context.query.matchId });
    return {
        props: { match: JSON.parse(JSON.stringify(match ?? {})), teamId: context.query.teamId }
    }
}

export default function SelectCoordinates({ match, teamId }: { match: Match, teamId: string }) {
    return (
        <PinPoint match={match} teamId={teamId} />
    )
}
