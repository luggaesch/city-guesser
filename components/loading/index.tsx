import styles from "./loading.module.css";
import {CircularProgress} from "@mui/material";

export default function Loading() {
    return (
        <div className={styles.loadingContainer}>
            <CircularProgress thickness={1.4} size={300} />
        </div>
    )
}