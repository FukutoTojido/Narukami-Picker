import { useReducer } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import Head from "next/head";

import { TeamName, Action } from "@/types/types";
import { ACTION_TYPE } from "@/types/types";
import { WS_SIGNALS } from "@/types/ws";

import teams from "../json/team.json";
import teams_ from "../json/teams_.json";

const initialState: TeamName = {
    left: 0,
    right: 1,
};

const reducer = (state: TeamName, action: Action) => {
    if (action.type === ACTION_TYPE.UPDATE_NAME) return { ...action.data };
    return { ...state };
};

// const WS_URL = "wss://express.satancraft.net:443/ws";
const WS_URL = "ws://localhost:9727/ws";

const Overlay = () => {
    const [overlayState, overlayDispatcher] = useReducer(reducer, { ...initialState });
    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const mes = JSON.parse(event.data);
            switch (mes.type) {
                case WS_SIGNALS.UPDATE_TEAM: {
                    overlayDispatcher({
                        type: ACTION_TYPE.UPDATE_NAME,
                        data: JSON.parse(mes.data),
                    });
                    break;
                }
            }
        },
        shouldReconnect: (closedEvent) => true,
    });

    return (
        <>
            <Head>
                <title>Narukami Overlay</title>
                <meta name="description" content="Overlay for Narukami Tournament" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/Logo.svg" />
            </Head>
            <div className="App">
                <div className="team left">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(${teams_.teams[overlayState.left].avatar})`,
                        }}
                    ></div>
                    <div className="name">{teams_.teams[overlayState.left].name}</div>
                </div>
                <div className="team right">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(${teams_.teams[overlayState.right].avatar})`,
                        }}
                    ></div>
                    <div className="name">{teams_.teams[overlayState.right].name}</div>
                </div>
                <style jsx>
                    {`
                        .App {
                            position: absolute;
                            top: 0;
                            left: 0;

                            width: 1920px;
                            height: 1080px;

                            background-image: url(/OverlayBackground.png);
                            background-size: cover;
                            background-position: center;
                        }

                        .team {
                            position: absolute;
                            top: 96px;

                            height: 74px;

                            display: flex;
                            align-items: center;
                            gap: 20px;

                            background: rgba(0 0 0 /0.5);
                            border-radius: 10px;

                            overflow: hidden;
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

                        .icon {
                            width: 144px;
                            height: 100%;

                            background-color: rgba(0 0 0 /0.5);
                            border-radius: 10px;

                            background-size: cover;
                            background-position: center;
                        }

                        .name {
                            font-size: 20px;
                            font-weight: 600;
                        }
                    `}
                </style>
            </div>
        </>
    );
};

export default Overlay;