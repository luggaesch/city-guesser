import axios from "axios";
import {useRouter} from "next/router";
import {useState} from "react";
import {IconButton, TextField} from "@mui/material";
import {ChevronRight, Search} from "@mui/icons-material";
import Feature from "../type/feature";

type ApiFeature = {
    place_name: string,
    center: number[],
    text: string
}

export default function Start() {
    const { push } = useRouter();
    const [teamNames, setTeamNames] = useState<string[]>([""]);
    const [city, setCity] = useState("");
    const [availableFeatures, setAvailableFeatures] = useState<ApiFeature[]>([]);
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null);
    const [chosenFeatures, setChosenFeatures] = useState<ApiFeature[]>([]);

    async function handleLookup() {
        const res = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
        const features: ApiFeature[] = [];
        res.data.features.forEach((f: any) => {
            const { place_name, center, text } = f;
            features.push({place_name, center, text});
        })
        setAvailableFeatures(features);
        setSelectedFeatureIndex(null);
    }

    return (
        <div style={{ gap: 10, width: "100vw", height: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: 10, backgroundColor: "#222222" }}>
            <div style={{ display: "flex", flexDirection: "column", padding: 10, borderRadius: 8, backgroundColor: "#282828", alignItems: "center" }}>
                <h2 style={{ color: "#eee", marginBottom: 18 }}>Teams</h2>
                {teamNames.map((name, index) => (
                    <TextField sx={{ input: { color: 'white' } }} style={{ width: "100%", color: "white" }} placeholder={"Enter Team Name"} key={index} onChange={(event) => {
                        const tn = [...teamNames];
                        tn[index] = event.target.value;
                        if (event.target.value !== "" && index === tn.length - 1) {
                            tn.push("");
                        } else {
                            if (event.target.value === "" && index === tn.length - 2 && tn[tn.length - 1] === "") {
                                tn.splice(tn.length - 1, 1);
                            }
                        }
                        setTeamNames(tn);
                    }
                    }>{name}</TextField>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: 10, backgroundColor: "#282828", borderRadius: 8, alignItems: "center" }}>
                <h2 style={{ color: "#eee", marginBottom: 18 }}>Places</h2>
                <div style={{ display: "grid", alignItems: "center", gridTemplateColumns: "10fr 1fr", width: "100%" }}>
                    <TextField sx={{ input: { color: 'white' } }} placeholder={"Enter City Name"} onChange={(event) => setCity(event.target.value)}>{city}</TextField>
                    <IconButton onClick={() => handleLookup()}>
                        <Search style={{ color: "white" }} />
                    </IconButton>
                </div>
                {availableFeatures.length > 0 && <p style={{ marginTop: 10, color: "#bbb" }}>Double Click Entry to add it to the list of places.</p>}
                <ul style={{ listStyle: "none", padding: 10, borderRadius: 8, display: "flex", flexDirection: "column" }}>
                    {availableFeatures.map((f, index) => (
                        <li style={{ cursor: "pointer", padding: 10, borderRadius: 8, color: "white", backgroundColor: selectedFeatureIndex === index ? "#333" : "transparent" }} onClick={() => {
                            if (selectedFeatureIndex === index) {
                                chosenFeatures.push(f);
                                setAvailableFeatures([]);
                                setSelectedFeatureIndex(null);
                                setCity("");
                                return;
                            }
                            setSelectedFeatureIndex(index);
                        }} key={index}>{f.place_name}</li>
                    ))}
                </ul>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "row", flexWrap: "wrap", position: "absolute", bottom: 5, left: 5, gap: 10  }}>
                    {chosenFeatures.map((f, index) => (
                        <li onClick={() => {
                            const arr = [...chosenFeatures];
                            arr.splice(index, 1);
                            setChosenFeatures(arr);
                        }} style={{ cursor: "pointer", height: 50, width: 100, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 8, backgroundColor: "#333", color: "white" }} key={index}>{f.text}</li>
                    ))}
                </ul>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {chosenFeatures.length > 0 && teamNames.length > 0 && teamNames[0] !== "" && <IconButton onClick={async () => {
                    const features = chosenFeatures.map((f) => {
                        return { name: f.text, lng: f.center[0], lat: f.center[1] };
                    });
                    const teams = teamNames.filter((t) => t !== "");
                    const res = await axios.post("/api/match/create", { teamNames: teams, features });
                    await push("/match/play/" + res.data._id);
                }
                } style={{ borderRadius: "50%", padding: 10, fontSize: 48, background: "#282828", width: 150, height: 150, color: "white", textAlign: "center" }} >
                    <ChevronRight style={{ fontSize: "inherit" }} />
                </IconButton>}
            </div>
        </div>
    )
}
