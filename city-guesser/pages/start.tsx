import axios from "axios";
import {useRouter} from "next/router";
import dynamic from 'next/dynamic'

const SearchBox = dynamic(() =>
    import('@mapbox/search-js-react').then((mod) => mod.SearchBox), { ssr: false }
)

console.log(SearchBox);

export default function Start() {
    const { push } = useRouter();

    return (
        <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div onClick={async () => {
                const res = await axios.post("/api/match/create", { teamNames: ["a", "b"] });
                await push("/match/play/" + res.data._id);
            }
            } style={{ fontSize: 22, width: "30vw", height: 200, background: "#222222", color: "white", textAlign: "center" }} >Start</div>
        </div>
    )
}
