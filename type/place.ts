import { z } from "zod";

export const longitude = z.number().gte(0).lte(180),
    latitude = z.number().gte(0).lte(90);

export const PlaceSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    lng: longitude,
    lat: latitude,
});

type Place = z.infer<typeof PlaceSchema>;

export default Place;