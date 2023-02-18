import Feature from "./feature";

export type Team = {
    _id?: string,
    name: String,
    selectedCoordinates: [{
        lng: number,
        lat: number,
    }]
}

type Match = {
    _id?: string,
    teams: Team[],
    phase: number,
    features: Feature[]
}

export default Match;
