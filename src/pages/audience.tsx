import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

import { WS_SIGNALS } from "@/types/ws";

import teams_ from "../json/teams_.json";

const WS_URL = "wss://express.satancraft.net:443/ws";

const Audience = () => {
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(1);

    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const mes = JSON.parse(event.data);

            if (mes.type === WS_SIGNALS.UPDATE_TEAM) {
                const data = JSON.parse(mes.data);
                setLeft(data.left);
                setLeft(data.right);
            }
        },
    });
    return (
        <div className="App">
            <video src="/Audiences Screen.webm" autoPlay muted loop></video>
            <div className="team left">
                <div className="name">{teams_.teams[left].name}</div>
            </div>
            <div className="team right">
                <div className="name">{teams_.teams[right].name}</div>
            </div>
            <style jsx>
                {`
                    .team {
                        position: absolute;
                        top: 96px;
                        width: 500px;

                        height: 74px;

                        border-radius: 10px;
                    }

                    .team.left {
                        left: 64px;
                        flex-direction: row;
                        padding-right: 20px;
                    }

                    .team.right {
                        right: 64px;
                        flex-direction: row-reverse;
                        padding-left: 20px;
                    }

                    .name {
                        position: absolute;
                        bottom: 85px;

                        font-size: 32px;
                        font-weight: 700;
                        font-style: italic;
                        color: #fef3f3;
                    }

                    .team.left .name {
                        left: 0;
                        text-align: left;
                    }

                    .team.right .name {
                        right: 0;
                        text-align: right;
                    }
                `}
            </style>
        </div>
    );
};

export default Audience;
