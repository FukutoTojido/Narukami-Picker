"use client";

import "./style.css";

import { useReducer, useEffect, useState } from "react";
import Head from "next/head";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { motion, AnimatePresence } from "framer-motion";

import { MapState, MappoolState, Action, User } from "@/types/types";
import { VERSION, PHASE, CHART_DIFF, ACTION_TYPE, SIDE } from "@/types/types";
import MapNode from "@/components/MapNode";
import { WS_SIGNALS } from "@/types/ws";

const mapPlaceholder: MapState = {
    artist: "クレシェンドブルー [最上静香 (CV.田所あずさ)、北上麗花 (CV.平山笑美)、北沢志保 (CV.雨宮 天)、野々原 茜 (CV.小笠原早紀)、箱崎星梨花 (CV.麻倉もも)]",
    title: "Shooting Stars",
    lvl: "12",
    type: CHART_DIFF.MASTER,
    version: VERSION.DX,
    image: "56bf1cdcbbf097c9.png",
    state: PHASE.NONE,
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

const initialState: MappoolState = {
    team: {
        left: "",
        right: "",
    },
    maps: {
        bans: {
            left: [null],
            right: [null],
        },
        picks: {
            left: null,
            right: null,
        },
        random: null,
        secret: null,
    },
    picked: {
        left: [],
        right: [],
    },
    round: 0,
};

const reducer = (state: MappoolState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.RESET: {
            state.maps = {
                bans: {
                    left: [...Array(roundList[state.round].nBans)].map(() => null),
                    right: [...Array(roundList[state.round].nBans)].map(() => null),
                },
                picks: {
                    left: null,
                    right: null,
                },
                random: null,
                secret: null,
            };
            state.picked = initialState.picked;
            return { ...state };
        }
        case ACTION_TYPE.UPDATE_MAPPOOL: {
            state.maps = action.data;

            return { ...state };
        }
        case ACTION_TYPE.UPDATE_NAME: {
            state.team = action.data;

            return { ...state };
        }
        case ACTION_TYPE.UPDATE_ROUND: {
            return {
                ...state,
                round: action.data,
            };
        }
        default: {
            return { ...state };
        }
    }
};

const WS_URL = "wss://express.satancraft.net:443/ws";
// const WS_URL = "ws://localhost:9727/ws";

const Page = () => {
    const [mappoolState, mappoolDispatcher] = useReducer(reducer, { ...initialState });
    const [countDown, setCountDown] = useState(0);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timer>();

    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const mes = JSON.parse(event.data);
            switch (mes.type) {
                case WS_SIGNALS.RESET: {
                    mappoolDispatcher({
                        type: ACTION_TYPE.RESET,
                    });
                    break;
                }
                case WS_SIGNALS.SHUFFLE:
                case WS_SIGNALS.UPDATE_MAPPOOL: {
                    const maps = JSON.parse(mes.data);
                    mappoolDispatcher({
                        type: ACTION_TYPE.UPDATE_MAPPOOL,
                        data: maps,
                    });
                    break;
                }
                case WS_SIGNALS.UPDATE_NAME: {
                    const team = JSON.parse(mes.data);
                    mappoolDispatcher({
                        type: ACTION_TYPE.UPDATE_NAME,
                        data: team,
                    });
                    break;
                }
                case WS_SIGNALS.UPDATE_ROUND: {
                    const idx = roundList.findIndex((round) => round.name === mes.data);
                    mappoolDispatcher({
                        type: ACTION_TYPE.UPDATE_ROUND,
                        data: idx,
                    });
                    break;
                }
            }
        },
        shouldReconnect: (closedEvent) => true,
    });

    useEffect(() => {
        if (countDown <= 0) clearInterval(timeoutId);
    }, [countDown]);
    return (
        <>
            <Head>
                <title>Narukami Mappool</title>
                <meta name="description" content="Mappool Overlay for Narukami Tournament" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/Logo.svg" />
            </Head>
            <div className="App">
                <video src="/Mappool Screen.webm" autoPlay muted loop></video>
                <div className="roundName">{roundList[mappoolState.round].name}</div>
                <div className="team left">
                    <div className="name">{mappoolState.team.left}</div>
                </div>
                <div className="team right">
                    <div className="name">{mappoolState.team.right}</div>
                </div>
                <div className="picked left"></div>
                <div className="picked right"></div>
                <div className="mapList">
                    <div className="label">Banned maps</div>
                    <div className="banList list">
                        <div className="left">
                            {mappoolState.maps.bans.left.map((map: MapState | null, idx) => {
                                return <MapNode data={map} side={SIDE.LEFT} key={idx} />;
                            })}
                        </div>
                        <div className="right">
                            {mappoolState.maps.bans.right.map((map: MapState | null, idx) => {
                                return <MapNode data={map} side={SIDE.RIGHT} key={idx} />;
                            })}
                        </div>
                    </div>
                    <div className="label">Picked maps</div>
                    <div className="pickList list">
                        <div className="left">
                            <MapNode data={mappoolState.maps.picks.left} side={SIDE.LEFT} />
                        </div>
                        <div className="right">
                            <MapNode data={mappoolState.maps.picks.right} side={SIDE.RIGHT} />
                        </div>
                    </div>
                    <div className="label">Chiếc nón kì diệu 🥳</div>
                    <MapNode data={mappoolState.maps.random} />
                </div>
            </div>
        </>
    );
};

export default Page;
