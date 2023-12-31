import { useReducer } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import Head from "next/head";

import { TeamName, Action } from "@/types/types";
import { ACTION_TYPE } from "@/types/types";
import { WS_SIGNALS } from "@/types/ws";

import teams from "../json/team.json";
import teams_ from "../json/teams_.json";

type OverlayState = {
    left: number;
    right: number;
    score: {
        left: number;
        right: number;
    };
    round: string;
};

const initialState: OverlayState = {
    left: 0,
    right: 1,
    score: {
        left: 0,
        right: 0,
    },
    round: "Quarter Finals",
};

const reducer = (state: OverlayState, action: Action) => {
    if (action.type === ACTION_TYPE.UPDATE_NAME) return { ...state, left: action.data.left, right: action.data.right };
    if (action.type === ACTION_TYPE.UPDATE_SCORE)
        return {
            ...state,
            score: action.data,
        };
    if (action.type === ACTION_TYPE.UPDATE_ROUND)
        return {
            ...state,
            round: action.data,
        };
    return { ...state };
};

const WS_URL = "wss://express.satancraft.net:443/ws";
// const WS_URL = "ws://localhost:9727/ws";

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
                case WS_SIGNALS.UPDATE_SCORE: {
                    overlayDispatcher({
                        type: ACTION_TYPE.UPDATE_SCORE,
                        data: JSON.parse(mes.data),
                    });
                    break;
                }
                case WS_SIGNALS.UPDATE_ROUND: {
                    overlayDispatcher({
                        type: ACTION_TYPE.UPDATE_ROUND,
                        data: mes.data,
                    });
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
                <video src="/Players Screen.webm" autoPlay muted loop></video>
                <div className="roundName">{overlayState.round}</div>
                <div className="team left">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(https://narukami.mune.moe/_next/image?url=${encodeURIComponent(
                                teams_.teams[overlayState.left].avatar
                            )}&w=1080&q=75)`,
                        }}
                    ></div>
                    <div className="accuracy">{overlayState.score.left.toFixed(4)}%</div>
                    <div className="name">{teams_.teams[overlayState.left].name}</div>
                </div>
                <div className="team right">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(https://narukami.mune.moe/_next/image?url=${encodeURIComponent(
                                teams_.teams[overlayState.right].avatar
                            )}&w=1080&q=75)`,
                        }}
                    ></div>
                    <div className="accuracy">{overlayState.score.right.toFixed(4)}%</div>
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

                             {
                                /* background-image: url(/OverlayBackground.png); */
                            }
                            background-size: cover;
                            background-position: center;
                        }

                        .team {
                            position: absolute;
                            top: 96px;

                            height: 74px;

                            display: flex;
                            align-items: center;
                            gap: 0px;

                            background: rgba(0 0 0 / 0.5);

                            border-radius: 10px;

                             {
                                /* overflow: hidden; */
                            }
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
                            position: absolute;
                            bottom: 85px;

                            font-size: 32px;
                            font-weight: 700;
                            font-style: italic;
                            color: #fef3f3;

                            letter-spacing: 2.24px;
                        }

                        .team.left .name {
                            left: 0;
                            text-align: left;
                        }

                        .team.right .name {
                            right: 0;
                            text-align: right;
                        }

                        .accuracy {
                            width: 200px;
                            text-align: center;
                            font-size: 23px;
                            font-style: italic;
                            letter-spacing: 0.1em;
                        }

                        .roundName {
                            position: absolute;
                            bottom: 0;
                            left: 0;

                            padding: 30px;
                            font-size: 40px;
                            font-weight: 600;
                            color: #fef3f3;

                            letter-spacing: 2.8px;
                        }

                        .roundName:after {
                            content: "Gameplay Screen";
                            position: absolute;

                            bottom: -20px;
                            left: 0;

                            font-size: 20px;
                            letter-spacing: 0.1em;
                            font-weight: 400;
                            font-style: italic;

                            padding: 30px;
                            opacity: 0.5;
                        }
                    `}
                </style>
            </div>
        </>
    );
};

export default Overlay;
