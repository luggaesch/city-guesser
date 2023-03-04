import {NextApiRequest, NextApiResponse} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";
import Match from "../../../type/match";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { matchId, teamId, points } = req.body;
        if (!matchId || !teamId || !points) {
            res.status(500).send("Malformed Request!");
            return;
        }
        await connectMongo;
        const queriedMatch = await MatchModel.findOne({ _id: matchId }) as Match;
        if (!queriedMatch) {
            res.status(400).send("No Quiz with ID in Database");
            return;
        }
        queriedMatch.teams.find((t) => String(t._id) === String(teamId))!.selectedCoordinates.push(...points.map((p: [number, number]) => ({ lng: p[0], lat: p[1] })));
        await queriedMatch.save();
        res.send(JSON.stringify(queriedMatch));
    } else {
        res.status(404).send({});
    }
}
