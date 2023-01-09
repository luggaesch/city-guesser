import {NextApiRequest, NextApiResponse} from "next";
import connectMongo from "../../../lib/connect-mongo";
import MatchModel from "../../../lib/schemas/match";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { teamNames } = req.body;
        if (teamNames === undefined || teamNames.length === 0) {
            res.status(500).send("Malformed Request");
            return;
        }
        await connectMongo;
        const match = await MatchModel.create({
            teams: teamNames.map((name: string) => ({ name }))
        });
        res.send(JSON.stringify(match));
    } else {
        res.status(404).send({});
    }
}
