import {latitude, longitude, PlaceSchema} from "./place";
import {z} from "zod";

// TODO: Validate in APIs

export const TeamSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    selectedCoordinates: z.array(z.object({
        lng: longitude,
        lat: latitude,
        placeId: z.string()
    }))
});

export const MatchZSchema = z.object({
    _id: z.string().optional(),
    teams: z.array(TeamSchema),
    phase: z.number(),
    places: z.array(PlaceSchema)
});

export type Team = z.infer<typeof TeamSchema>;

type Match = z.infer<typeof MatchZSchema>;

export default Match;
