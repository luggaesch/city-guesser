import {NextApiRequest, NextApiResponse} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { matchId, teamId, lng, lat } = req.body;
        if (!matchId || !teamId || lng === undefined || lat === undefined) {
            res.status(500).send("Malformed Request!");
            return;
        }
        await connectMongo;
        const queriedMatch = await MatchModel.findOne({ _id: matchId });
        if (!queriedMatch) {
            res.status(400).send("No Quiz with ID in Database");
            return;
        }
        queriedMatch.teams.find((t) => String(t._id) === String(teamId))!.selectedCoordinates = { lng, lat, timestamp: new Date() };
        await queriedMatch.save();
        res.send(JSON.stringify(queriedMatch));
    } else {
        res.status(404).send({});
    }
}
