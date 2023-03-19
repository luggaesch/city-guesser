import {useRouter} from "next/router";
import {useMemo, useState} from "react";
import {ApiFeature} from "../../lib/mapbox";
import styles from "./create.module.css";
import {CircularProgress, IconButton} from "@mui/material";
import {ChevronRight} from "@mui/icons-material";
import axios from "axios";
import PlacePreview from "./place-preview";
import PlaceLookup from "./place-lookup";
import TeamInput from "./team-input";
import Loading from "../../components/loading";

export default function CreateGame() {
    const { push } = useRouter();
    const [teamNames, setTeamNames] = useState<string[]>([""]);
    const [chosenFeatures, setChosenFeatures] = useState<ApiFeature[]>([]);
    const canSubmit = useMemo(() => {
        return chosenFeatures.length > 0 && teamNames.length > 1 && teamNames[0] !== "" && teamNames[1] !== ""
    }, [chosenFeatures.length, teamNames]);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        const features = chosenFeatures.map((f) => {
            return { name: f.text, lng: f.center[0], lat: f.center[1] };
        });
        const teams = teamNames.filter((t) => t !== "");
        const res = await axios.post("/api/match/create", { teamNames: teams, features });
        await push("/match/play/" + res.data._id);
        setLoading(false);
    }

    return (
        <div className={styles.createContainer}>
            <div>
                <h2 className={styles.containerLabel}>Teams</h2>
                <TeamInput teamNames={teamNames} setTeamNames={setTeamNames} />
            </div>
            <div>
                <h2 className={styles.containerLabel}>Places</h2>
                <PlaceLookup features={chosenFeatures} setFeatures={setChosenFeatures} />
                <PlacePreview features={chosenFeatures} setFeatures={setChosenFeatures} />
            </div>
            <div className={styles.submitContainer}>
                {canSubmit && <IconButton className={styles.iconButton} onClick={handleSubmit}>
                    <ChevronRight />
                </IconButton>}
            </div>
            {loading && <Loading />}
        </div>
    )

}