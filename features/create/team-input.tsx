import {TextField} from "@mui/material";
import styles from "./create.module.css";
import {Dispatch, SetStateAction} from "react";

export default function TeamInput({ teamNames, setTeamNames }: { teamNames: string[], setTeamNames: Dispatch<SetStateAction<string[]>> }) {

    function onTeamInput(value: string, index: number) {
        const tn = [...teamNames];
        tn[index] = value;
        if (value !== "" && index === tn.length - 1) {
            tn.push("");
        } else {
            if (value === "" && index === tn.length - 2 && tn[tn.length - 1] === "") {
                tn.splice(tn.length - 1, 1);
            }
        }
        setTeamNames(tn);
    }

    return (
        <>
            {teamNames.map((name, index) => (
                <TextField sx={{ input: { color: 'white' } }}
                           className={styles.textInput} placeholder={"Enter Team Name"} key={index}
                           onChange={(event) => onTeamInput(event.target.value, index)}>
                    {name}
                </TextField>
            ))}
        </>
    )
}