import { useReducer, useEffect, useState } from "react";
import Head from "next/head";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { motion, AnimatePresence } from "framer-motion";

import { MapState, MappoolState, Action, User } from "@/types/types";
import { VERSION, PHASE, CHART_DIFF, ACTION_TYPE } from "@/types/types";
import MapNode from "@/components/MapNode";
import Player from "@/components/Player";
import { WS_SIGNALS } from "@/types/ws";

import teams from "../json/team.json";
import teams_ from "../json/teams_.json";

const mapPlaceholder: MapState = {
    artist: "クレシェンドブルー [最上静香 (CV.田所あずさ)、北上麗花 (CV.平山笑美)、北沢志保 (CV.雨宮 天)、野々原 茜 (CV.小笠原早紀)、箱崎星梨花 (CV.麻倉もも)]",
    title: "Shooting Stars",
    lvl: "12",
    type: CHART_DIFF.MASTER,
    version: VERSION.DX,
    image: "56bf1cdcbbf097c9.png",
    state: PHASE.NONE,
};

const initialState: MappoolState = {
    team: {
        left: 0,
        right: 1,
    },
    maps: [],
    picked: {
        left: [],
        right: [],
    },
    round: "Quarter Finals",
};

const reducer = (state: MappoolState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.RESET: {
            state.maps = [];
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

const Mappool = () => {
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
                case WS_SIGNALS.UPDATE_TEAM: {
                    const team = JSON.parse(mes.data);
                    mappoolDispatcher({
                        type: ACTION_TYPE.UPDATE_NAME,
                        data: team,
                    });
                    break;
                }
                case WS_SIGNALS.START_SIGNALING: {
                    setCountDown(60);
                    clearInterval(timeoutId);

                    const Id = setInterval(() => {
                        setCountDown((countDown) => countDown - 1);
                    }, 1000);
                    setTimeoutId(Id);

                    break;
                }
                case WS_SIGNALS.UPDATE_ROUND: {
                    mappoolDispatcher({
                        type: ACTION_TYPE.UPDATE_ROUND,
                        data: mes.data,
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
                <div className="roundName">{mappoolState.round}</div>
                <div className="team left">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(https://narukami.mune.moe/_next/image?url=${encodeURIComponent(
                                teams_.teams[mappoolState.team.left].avatar
                            )}&w=1080&q=75)`,
                        }}
                    ></div>
                    <div className="name">{teams_.teams[mappoolState.team.left].name}</div>
                </div>
                <div className="team right">
                    <div
                        className="icon"
                        style={{
                            backgroundImage: `url(https://narukami.mune.moe/_next/image?url=${encodeURIComponent(
                                teams_.teams[mappoolState.team.right].avatar
                            )}&w=1080&q=75)`,
                        }}
                    ></div>
                    <div className="name">{teams_.teams[mappoolState.team.right].name}</div>
                </div>
                <div className="picked left">
                    <Player data={teams_.teams[mappoolState.team.left].members[0] as User} />
                    <Player data={teams_.teams[mappoolState.team.left].members[1] as User} />
                </div>
                <div className="picked right">
                    <Player data={teams_.teams[mappoolState.team.right].members[0] as User} />
                    <Player data={teams_.teams[mappoolState.team.right].members[1] as User} />
                </div>
                <div className="countdown">00:{countDown.toString().padStart(2, "0")}</div>
                <div className="mapList">
                    <AnimatePresence>
                        {mappoolState.maps.map((map, idx) => {
                            return (
                                <motion.div
                                    style={{
                                        width: "1fr",
                                        overflow: "hidden",
                                    }}
                                    key={idx}
                                    initial={{ opacity: 0, y: -100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -100 }}
                                    transition={{ duration: 0.2, ease: "easeInOut", delay: idx * 0.05 }}
                                >
                                    <MapNode map={map} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
                <style jsx>{`
                    video {
                        position: absolute;
                    }
                    .App {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 1920px;
                        height: 1080px;

                         {
                            /* background-image: url(/MappoolBackground.png); */
                        }
                        background-size: cover;
                        background-position: center;

                        display: flex;
                        justify-content: center;
                        align-content: center;
                        align-items: center;
                    }

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

                    .icon {
                        position: absolute;
                        top: 0;

                        width: 144px;
                        height: 100%;

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;

                        background-size: cover;
                        background-position: center;
                    }

                    .team.left .icon {
                        left: 0;
                    }

                    .team.right .icon {
                        right: 0;
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

                    .picked {
                        position: absolute;
                        top: 549px;

                        width: 400px;
                        height: 309px;

                        padding: 50px;

                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .picked.left {
                        left: 64px;
                    }

                    .picked.right {
                        right: 64px;
                    }

                    .mapList {
                        width: 720px;
                        min-height: 681px;
                        padding: 44px;

                         {
                            /* background-color: #33212c; */
                        }
                        border-radius: 10px;

                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 40px;

                        overflow: hidden;
                        transition: ease-in-out 200ms;
                        translate: 0 10px;
                    }

                    .countdown {
                        position: absolute;
                        top: 150px;

                        font-size: 32px;
                        font-weight: 700;
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
                        content: "Mappool Screen";
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
                `}</style>
            </div>
        </>
    );
};

export default Mappool;
