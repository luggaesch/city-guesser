import {NextApiRequest, NextApiResponse} from "next";
import connectMongo from "../../../../lib/connect-mongo";
import MatchModel from "../../../../lib/schemas/match";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const matchId = String(req.query.matchId);
    if (!matchId) {
        res.status(500).send("No Match Id provided.");
        return;
    }
    await connectMongo;
    const match = await MatchModel.findOne({ _id: matchId });
    if (!match) {
        res.status(400).send("No Match with ID in Database");
        return;
    }
    res.send(JSON.stringify(match));
}
