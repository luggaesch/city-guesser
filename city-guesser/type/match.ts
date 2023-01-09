export type Team = {
    _id?: string,
    name: String,
    selectedCoordinates: {
        lng: number,
        lat: number,
        timestamp: Date
    }
}

type Match = {
    _id?: string,
    teams: Team[],
    phase: number,
}

export default Match;
