import styles from "./create.module.css";
import {Map, Marker} from "react-map-gl";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {ApiFeature, MapStyles} from "../../lib/mapbox";
import {Dispatch, SetStateAction} from "react";

export default function PlacePreview({ features, setFeatures }: { features: ApiFeature[], setFeatures: Dispatch<SetStateAction<ApiFeature[]>> }) {

    return (
        <ul className={styles.featurePreview}>
            {features.map((f, index) => (
                <li key={index}>
                    <Map mapStyle={MapStyles.Satellite} interactive={false} initialViewState={{ longitude: f.center[0], latitude: f.center[1], zoom: 2 }} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}>
                        <Marker longitude={f.center[0]} latitude={f.center[1]} />
                    </Map>
                    <span>{f.text}</span>
                    <IconButton className={styles.iconButton} onClick={() => {
                        const arr = [...features];
                        arr.splice(index, 1);
                        setFeatures(arr);
                    }}>
                        <Delete />
                    </IconButton>
                </li>
            ))}
        </ul>
    )
}