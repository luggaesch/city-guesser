import axios from "axios";
import {z} from "zod";
import Place from "../type/place";

const prefix = "mapbox://styles";
const mapboxDomain = "mapbox";
export const MapStyles = {
    NoLabel: `${prefix}/roflcopta123/cletuhqoz00a201o859pd3guo`,
    Label: `${prefix}/${mapboxDomain}/dark-v10`,
    Satellite: `mapbox://styles/mapbox/satellite-v9`
}

const ApiFeatureSchema = z.object({
    place_name: z.string(),
    center: z.array(z.number()).length(2),
    text: z.string()
});

const ApiResponse = z.object({
    status: z.literal(200),
    data: z.object({
        features: ApiFeatureSchema.array().min(1)
    })
});

export type ApiFeature = z.infer<typeof ApiFeatureSchema>;

function getGeoCodingURL(placeName: string) {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${placeName}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
}

export default async function lookupPlaces(query: string): Promise<ApiFeature[] | null> {
    const res = await axios.get(getGeoCodingURL(query));
    if (!ApiResponse.safeParse(res)) {
        return null;
    }
    return res.data.features.map((f: ApiFeature) => (
        {
            place_name: f.place_name, center: f.center, text: f.text
        }
    ));
}

export function convertToPlaces(features: ApiFeature[]): Place[] {
    return features.map((f) => {
        return { name: f.text, lng: f.center[0], lat: f.center[1] };
    });
}