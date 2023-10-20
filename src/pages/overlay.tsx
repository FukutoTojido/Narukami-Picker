import { useReducer } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import Head from "next/head";

import { TeamName, Action } from "@/types/types";
import { ACTION_TYPE } from "@/types/types";
import { WS_SIGNALS } from "@/types/ws";

import teams from "../json/team.json";
import teams_ from "../json/teams_.json";

type OverlayState = {
    left: number | string;
    right: number | string;
    score: {
        left: number;
        right: number;
    };
    round: number;
};

const roundList = [
    {
        name: "Round of 16",
        nBans: 1,
        limit: ["12+", "13"],
    },
    {
        name: "Quarter Finals",
        nBans: 1,
        limit: ["13", "13+"],
    },
    {
        name: "Semi Finals",
        nBans: 2,
        limit: ["13+", "14"],
    },
    {
        name: "Finals",
        nBans: 2,
        limit: ["14", "14+"],
    },
];

const initialState: OverlayState = {
    left: "",
    right: "",
    score: {
        left: 0,
        right: 0,
    },
    round: 0,
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
                case WS_SIGNALS.UPDATE_NAME: {
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
                    const idx = roundList.findIndex((round) => round.name === mes.data);

                    overlayDispatcher({
                        type: ACTION_TYPE.UPDATE_ROUND,
                        data: idx,
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
                <div className="roundName">{roundList[overlayState.round].name}</div>
                <div className="team left">
                    <div className="name">{overlayState.left}</div>
                    <div className="accuracy">{overlayState.score.left.toFixed(4)}%</div>
                </div>
                <div className="team right">
                    <div className="name">{overlayState.right}</div>
                    <div className="accuracy">{overlayState.score.right.toFixed(4)}%</div>
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
                            top: 37px;

                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }

                        .team.left {
                            left: 64px;
                            align-items: flex-start;
                        }

                        .team.right {
                            right: 64px;
                            align-items: flex-end;
                        }

                        .name {
                            height: 40px;
                            line-height: 40px;
                            font-size: 32px;
                            font-weight: 700;
                            font-style: italic;
                            color: #fef3f3;

                            letter-spacing: 2.24px;
                        }

                        .team.left .name {
                            text-align: left;
                        }

                        .team.right .name {
                            text-align: right;
                        }

                        .accuracy {
                            width: 220px;
                            border-radius: 10px;

                            padding: 2px 0;

                            font-size: 20px;
                            font-style: italic;
                            letter-spacing: 0.1em;

                            text-align: center;

                            {/* background: rgba(0 0 0 / 0.5); */}
                        }

                        .roundName {
                            position: absolute;
                            bottom: 0;
                            left: 0;

                            width: 400px;

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
