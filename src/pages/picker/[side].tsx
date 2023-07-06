import { useEffect, useReducer, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useRouter } from "next/router";
import Head from "next/head";

import { MuseoModerno } from "next/font/google";

import { MapState, MainState, Action } from "@/types/types";
import { VERSION, PHASE, CHART_DIFF, ACTION_TYPE } from "@/types/types";
import { WsAction, WS_SIGNALS } from "@/types/ws";

const teamEncryptor: { [side: string]: string } = {
    "2cba9d25c1eaf7f3ef0e86b1562165b1d66e950ff5155de71b68049916145faf": "Left",
    c4ce3c7ad82c8235da21fae8ea48e071a10e7b1c6df6a9e5b4603852d8b3001c: "Right",
};

const mm = MuseoModerno({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const mapPlaceholder: MapState = {
    artist: "クレシェンドブルー [最上静香 (CV.田所あずさ)、北上麗花 (CV.平山笑美)、北沢志保 (CV.雨宮 天)、野々原 茜 (CV.小笠原早紀)、箱崎星梨花 (CV.麻倉もも)]",
    title: "Shooting Stars",
    lvl: "12",
    type: CHART_DIFF.MASTER,
    version: VERSION.DX,
    image: "56bf1cdcbbf097c9.png",
    state: PHASE.NONE,
};

const initialState: MainState = {
    phase: PHASE.BAN,
    max: {
        nBans: 1,
        nPicks: 1,
    },
    lock: {
        ban: false,
        pick: false,
        all: false,
        idle: false,
    },
    maps: [],
};

const reducer = (state: MainState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.LOAD_MAPS: {
            state.maps = action.data!;
            return { ...state };
        }
        case ACTION_TYPE.SET_MAP: {
            if (state.lock.all) return { ...state };

            state.maps[action.data!.idx].state = action.data.state;
            state.lock.ban = state.maps.filter((map) => map.state === PHASE.BAN).length >= state.max.nBans;
            state.lock.pick = state.maps.filter((map) => map.state === PHASE.PICK).length >= state.max.nPicks;

            return { ...state };
        }
        case ACTION_TYPE.RESET: {
            state.maps = initialState.maps;
            return { ...state };
        }
        case ACTION_TYPE.CHANGE_PHASE: {
            state.phase = action.data;
            return { ...state };
        }
        case ACTION_TYPE.LOCK_ALL: {
            state.lock.all = action.data;
            return { ...state };
        }
        case ACTION_TYPE.IDLE: {
            state.lock.idle = action.data;
            return { ...state };
        }
        case ACTION_TYPE.CHANGE_BAN_LIMIT: {
            state.max.nBans = action.data;
            return { ...state };
        }
        default: {
            return { ...state };
        }
    }
};

const upFirstChar = (str: string): string => {
    return str.at(0)?.toUpperCase() + str.slice(1);
};

// const WS_URL = "wss://express.satancraft.net:443/ws";
const WS_URL = "ws://localhost:9727/ws";

const Picker = () => {
    const [pickerState, pickerDispatch] = useReducer(reducer, { ...initialState });
    const [countDown, setCountDown] = useState(0);
    const [unlock, setUnlock] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
    const router = useRouter();

    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const mes = JSON.parse(event.data);
            switch (mes.type) {
                case WS_SIGNALS.SWITCH_IDLE: {
                    pickerDispatch({
                        type: ACTION_TYPE.IDLE,
                        data: mes.data,
                    });
                    break;
                }
                case WS_SIGNALS.START_SIGNALING: {
                    setCountDown(30);
                    break;
                }
                case WS_SIGNALS.CHANGE_BAN_LIMIT: {
                    pickerDispatch({
                        type: ACTION_TYPE.CHANGE_BAN_LIMIT,
                        data: mes.data,
                    });
                    break;
                }
                case WS_SIGNALS.RESET: {
                    pickerDispatch({
                        type: ACTION_TYPE.RESET,
                    });
                    break;
                }
                case WS_SIGNALS.SHUFFLE: {
                    const maps: MapState[] = JSON.parse(mes.data);
                    pickerDispatch({
                        type: ACTION_TYPE.LOAD_MAPS,
                        data: maps,
                    });
                    break;
                }
            }
        },
        shouldReconnect: (closedEvent) => true,
    });

    useEffect(() => {
        setUnlock(Object.keys(teamEncryptor).includes(router.query.side as string));
    }, [router.query.side]);

    useEffect(() => {
        if (countDown <= 0) {
            pickerDispatch({
                type: ACTION_TYPE.LOCK_ALL,
                data: true,
            });
            return;
        } else {
            pickerDispatch({
                type: ACTION_TYPE.LOCK_ALL,
                data: false,
            });

            clearTimeout(timeoutId);
        }

        const Id = setTimeout(() => {
            setCountDown(countDown - 1);
        }, 1000);

        setTimeoutId(Id);
    }, [countDown]);

    return (
        <>
            <Head>
                <title>Narukami Picker</title>
                <meta name="description" content="Mappool Ban-Pick for Narukami Tournament" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/Logo.svg" />
            </Head>
            <div className="App">
                {pickerState.lock.idle || !unlock ? (
                    <div className="afkScreen">
                        <div className="logoBig"></div>
                        <div className="placeholder">IDLING...</div>
                    </div>
                ) : (
                    <>
                        <div className="leftCol">
                            <div className="logo"></div>
                            <div className="countdown">
                                <span>Countdown</span> 00:{countDown.toString().padStart(2, "0")}
                            </div>
                            <div className="phaseChanger">
                                <div className="label">Current Phase</div>
                                <div className={`indicator ${pickerState.phase}`}>{pickerState.phase}</div>
                                <div className="label">Current Team</div>
                                <div className="indicator">{teamEncryptor[router.query.side as string] ?? "None"} Team</div>
                            </div>
                            <button
                                className={mm.className}
                                onClick={() =>
                                    pickerDispatch({
                                        type: ACTION_TYPE.CHANGE_PHASE,
                                        data: pickerState.phase === PHASE.BAN ? PHASE.PICK : PHASE.BAN,
                                    })
                                }
                                disabled={pickerState.lock.all}
                            >
                                Switch Phase
                            </button>
                            <button className={mm.className} disabled={!pickerState.lock.all}>
                                Random
                            </button>
                        </div>
                        <div className="mapList">
                            {pickerState.maps.map((map, idx) => {
                                return (
                                    <div
                                        className="mapNode"
                                        key={idx}
                                        style={{
                                            backgroundImage: `linear-gradient(-90deg, rgba(127, 109, 116, 1) 20%, rgba(0 0 0 / .7)), url(https://maimaidx-eng.com/maimai-mobile/img/Music/${map.image})`,
                                        }}
                                        onClick={() => {
                                            if (
                                                ((pickerState.lock.ban && pickerState.phase === PHASE.BAN) ||
                                                    (pickerState.lock.pick && pickerState.phase === PHASE.PICK)) &&
                                                map.state === PHASE.NONE
                                            )
                                                return;

                                            pickerDispatch({
                                                type: ACTION_TYPE.SET_MAP,
                                                data: {
                                                    idx: idx,
                                                    state: map.state !== PHASE.NONE ? PHASE.NONE : pickerState.phase,
                                                },
                                            });
                                        }}
                                    >
                                        <div
                                            className="mapCover"
                                            style={{
                                                backgroundImage: `url(https://maimaidx-eng.com/maimai-mobile/img/Music/${map.image})`,
                                            }}
                                        ></div>
                                        <div className="metadata">
                                            <div className="title">{map.title}</div>
                                            <div className="artist">{map.artist}</div>
                                            <div className={`type ${map.type === CHART_DIFF.RE_MASTER ? "REMAS" : map.type}`}>{map.type}</div>
                                        </div>
                                        <div
                                            className="version"
                                            style={{
                                                backgroundImage: `url(/${map.version}.png)`,
                                            }}
                                        ></div>
                                        <div className="level">
                                            Lv<span>{map.lvl}</span>
                                        </div>
                                        <div
                                            className={`state ${map.state} ${
                                                (pickerState.lock.ban && pickerState.phase === PHASE.BAN) ||
                                                (pickerState.lock.pick && pickerState.phase === PHASE.PICK) ||
                                                pickerState.lock.all
                                                    ? "lock"
                                                    : ""
                                            }`}
                                        ></div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <style jsx>{`
                    @keyframes spin {
                        0% {
                            rotate: 0deg;
                        }
                        100% {
                            rotate: 360deg;
                        }
                    }

                    .App {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100vw;
                        height: 100vh;
                        padding: 20px;

                        background-image: linear-gradient(0deg, #3d313b, #593e44);
                        display: flex;
                        align-items: flex-start;
                        gap: 20px;
                    }

                    .logo {
                        width: 50%;
                        aspect-ratio: 1 / 1;

                        background-image: url(/Logo.png);
                        background-size: 60%;
                        background-position: center;
                        background-repeat: no-repeat;
                    }

                    .countdown {
                        width: 100%;
                        text-align: center;

                        font-size: 48px;
                        font-weight: 600;

                        display: flex;
                        flex-direction: column;

                        color: #f0cfd7;
                    }

                    .countdown span {
                        display: block;
                        font-size: 20px;
                    }

                    .leftCol {
                        width: 30%;
                        height: 100%;

                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;

                        color: #f0cfd7;
                        background-color: rgba(0 0 0 /0.3);
                        border-radius: 10px;

                        padding: 20px;
                    }

                    .phaseChanger {
                        width: 100%;
                        padding: 20px;

                        display: flex;
                        flex-direction: column;

                        background: rgba(0 0 0 / 0.3);
                        border-radius: 10px;
                    }

                    .indicator {
                        font-size: 32px;
                        font-weight: 700;

                        transition: ease-in-out 200ms;
                    }

                    .indicator.BAN {
                        color: #f23a65;
                    }

                    .indicator.PICK {
                        color: #3aa6f2;
                    }

                    .label {
                        font-size: 14px;
                    }

                    .leftCol button {
                        appearance: none;
                        border: none;
                        background: none;

                        width: 100%;

                        background-image: linear-gradient(90deg, rgba(123, 89, 118, 1) 0%, rgba(119, 86, 93, 1) 100%);
                        padding: 20px;

                        font-size: 24px;
                        font-weight: 600;

                        border-radius: 10px;

                        user-select: none;
                    }

                    .leftCol button:active {
                        opacity: 0.5;
                    }

                    .leftCol button:disabled:active {
                        opacity: 1;
                    }

                    .mapList {
                        flex: 1;

                        padding: 20px;
                        background-color: rgba(0 0 0 / 0.3);
                        border-radius: 10px;

                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        align-content: flex-start;
                    }

                    .mapNode {
                        position: relative;

                        width: 1fr;
                        height: 100px;
                        padding: 15px;

                        background-color: rgba(0 0 0 / 0.5);
                        border-radius: 10px;

                        background-size: cover;
                        background-position: center;

                        display: flex;
                        gap: 20px;

                        overflow: hidden;
                        user-select: none;
                    }

                    .state {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100%;
                        height: 100%;

                        border-radius: 10px;
                        opacity: 0;

                        border: solid 4px transparent;

                        transition: ease-in-out 100ms;
                    }

                    .state.BAN {
                        opacity: 1;
                        border: solid 4px #f23a65;
                    }

                    .state.PICK {
                        opacity: 1;
                        border: solid 4px #3aa6f2;
                    }

                    .state.NONE.lock {
                        opacity: 1;
                        background-color: rgba(0 0 0 /0.5);
                    }

                    .mapCover {
                        aspect-ratio: 1 / 1;
                        height: 100%;
                        background-size: cover;
                        background-position: center;

                        border-radius: 10px;
                    }

                    .metadata {
                        flex: 1;

                        display: flex;
                        flex-direction: column;
                        justify-content: center;

                        overflow: hidden;
                    }

                    .metadata * {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;

                        text-shadow: 0 1px 1px black;
                    }

                    .title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #fdedf9;
                    }

                    .artist {
                        font-size: 12px;
                        font-weight: 600;
                        color: #dabfc5;
                    }

                    .type {
                        font-size: 20px;
                        font-weight: 700;
                    }

                    .BASIC {
                        color: #80d24d;
                    }

                    .ADVANCED {
                        color: #f0bc30;
                    }

                    .EXPERT {
                        color: #f3898e;
                    }

                    .MASTER {
                        color: #a869df;
                    }

                    .REMAS {
                        color: #d3abf5;
                    }

                    .level {
                        position: absolute;
                        bottom: 0;
                        right: 0;

                        padding: 10px 15px;
                        font-style: italic;
                        color: #faeef4;
                    }

                    .level span {
                        font-size: 18px;
                        font-weight: 600;
                    }

                    .version {
                        position: absolute;
                        top: 0;
                        right: 0;

                        margin: 10px;

                        width: 60px;
                        height: 12px;

                        background-color: white;
                        border-radius: 6px;

                        background-size: contain;
                        background-position: center right;
                        background-repeat: no-repeat;
                    }

                    .afkScreen {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100%;
                        height: 100%;

                        background-image: url(/afkScreen.png);
                        background-size: cover;
                        background-position: center;

                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;

                        transition: ease-in-out 200ms;
                    }

                    .logoBig {
                        width: 400px;
                        height: 400px;

                        background-image: url(/Logo.png);
                        background-size: 60%;
                        background-position: center;
                        background-repeat: no-repeat;

                        animation: spin 60s infinite linear;
                    }

                    .placeholder {
                        font-size: 48px;
                        font-weight: 600;

                        color: #f0cfd7;
                    }
                `}</style>
            </div>
        </>
    );
};

export default Picker;
