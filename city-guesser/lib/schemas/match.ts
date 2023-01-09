import mongoose from "mongoose";
import Match from "../../type/match";

const MatchSchema = new mongoose.Schema({
    teams: [
        {
            type: new mongoose.Schema({
                name: { type: String, required: true },
                selectedCoordinates: {
                    type: new mongoose.Schema({
                        lng: { type: Number, required: true },
                        lat: { type: Number, required: true },
                        timestamp: { type: Date, default: new Date(), required: true },
                    }),
                    required: false
                }
            }),
            required: true,
            default: []
        }
    ],
    phase: {
        type: Number,
        default: 0,
        required: true
    },
});

let MatchModel: mongoose.Model<Match>;
try {
    MatchModel = mongoose.model<Match>("match");
} catch (err) {
    MatchModel = mongoose.model<Match>("match", MatchSchema);
}

export default MatchModel;
