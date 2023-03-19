import styles from "./create.module.css";
import {IconButton, TextField} from "@mui/material";
import {Search} from "@mui/icons-material";
import lookupPlaces, {ApiFeature} from "../../lib/mapbox";
import {Dispatch, SetStateAction, useState} from "react";

export default function PlaceLookup({ features, setFeatures }: { features: ApiFeature[], setFeatures: Dispatch<SetStateAction<ApiFeature[]>> }) {
    const [placeQuery, setPlaceQuery] = useState("");
    const [availableFeatures, setAvailableFeatures] = useState<ApiFeature[]>([]);
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null);

    async function handleLookup() {
        const features = await lookupPlaces(placeQuery);
        // TODO: Feedback on Lookup Fail
        if (!features) return;
        setAvailableFeatures(features);
        setSelectedFeatureIndex(null);
    }

    function handleFeatureClick(feature: ApiFeature, index: number) {
        if (selectedFeatureIndex === index) {
            setFeatures([...features, feature]);
            setAvailableFeatures([]);
            setSelectedFeatureIndex(null);
            setPlaceQuery("");
            return;
        }
        setSelectedFeatureIndex(index);
    }

    return (
        <>
            <div className={styles.lookup}>
                <TextField onKeyDown={(event) => {
                    event.key === "Enter" && handleLookup()
                }} sx={{ input: { color: 'white' } }} placeholder={"Enter City Name"} onChange={(event) => setPlaceQuery(event.target.value)}>{placeQuery}</TextField>
                <IconButton className={styles.iconButton} onClick={handleLookup}>
                    <Search />
                </IconButton>
            </div>
            {availableFeatures.length > 0 && <p className={styles.clickHint}>Double Click Entry to add it to the list of places.</p>}
            <ul className={styles.featureList}>
                {availableFeatures.map((f, index) => (
                    <li className={selectedFeatureIndex === index ? styles.selected : ""} onClick={() => {
                        handleFeatureClick(f, index)
                    }} key={index}>{f.place_name}</li>
                ))}
            </ul>
        </>
    )
}