import Head from "next/head";
import { useReducer, useState, useRef, useEffect } from "react";
import { MuseoModerno } from "next/font/google";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

import { ControllerState, Action, SIDE, ACTION_TYPE, VERSION, CHART_DIFF, FilteredMapData, PHASE, MapState } from "@/types/types";
import { WsAction, WS_SIGNALS } from "@/types/ws";

import teams_ from "../../json/teams_.json";
import songs from "../../json/songs.json";

const roundList = [
    {
        name: "Quarter Finals",
        nBans: 1,
        limit: ["12+", "13"],
    },
    {
        name: "Semi Finals",
        nBans: 1,
        limit: ["13", "13+"],
    },
    {
        name: "Finals",
        nBans: 2,
        limit: ["13+", "14"],
    },
    {
        name: "Grand Finals",
        nBans: 2,
        limit: ["14", "14+"],
    },
];

const getDiff = (diff: string) => {
    return songs.reduce((accumulated: FilteredMapData[], map) => {
        const sameSetFiltering: FilteredMapData[] = [];
        if (map.dx_lev_remas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.RE_MASTER,
                lvl: map.dx_lev_remas,
            });
        if (map.dx_lev_mas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.MASTER,
                lvl: map.dx_lev_mas,
            });
        if (map.dx_lev_exp === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.EXPERT,
                lvl: map.dx_lev_exp,
            });
        if (map.lev_remas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.RE_MASTER,
                lvl: map.lev_remas,
            });
        if (map.lev_mas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.MASTER,
                lvl: map.lev_mas,
            });
        if (map.lev_exp === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.EXPERT,
                lvl: map.lev_exp,
            });
        return accumulated.concat(sameSetFiltering);
    }, []);
};

const random = (limitList: string[]) => {
    const min = getDiff(limitList[0]);
    const max = getDiff(limitList[1]);

    const randomMin = [...min].sort(() => 0.5 - Math.random()).slice(0, 5);
    const randomMax = [...max].sort(() => 0.5 - Math.random()).slice(0, 5);

    return randomMin.concat(randomMax).sort(() => 0.5 - Math.random());
};

const mm = MuseoModerno({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const initialState: ControllerState = {
    team: {
        left: 0,
        right: 1,
    },
    round: 0,
    maps: [],
    state: {
        idle: false,
        acceptRand: false,
    },
};

const reducer = (state: ControllerState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_TEAM: {
            if (action.data.side === SIDE.LEFT) state.team.left = action.data.team;
            if (action.data.side === SIDE.RIGHT) state.team.right = action.data.team;

            return { ...state };
        }
        case ACTION_TYPE.SWITCH_STATE: {
            state.state = action.data;
            return { ...state };
        }
        case ACTION_TYPE.CHANGE_ROUND: {
            state.round = action.data;
            return { ...state };
        }
        case ACTION_TYPE.LOAD_MAPS: {
            state.maps = action.data;
            return { ...state };
        }
        default: {
            return { ...state };
        }
    }
};

// const WS_URL = "wss://express.satancraft.net:443/ws";
const WS_URL = "ws://localhost:9727/ws";

const Controller = () => {
    const [controllerState, controllerDispatcher] = useReducer(reducer, initialState);
    const [popout, setPopout] = useState(false);
    const [currentSelected, setCurrentSelected] = useState(SIDE.NONE);
    const popoutRef = useRef<HTMLDivElement>(null);
    const outsideRef = useRef<HTMLDivElement>(null);

    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {},
        shouldReconnect: (closedEvent) => true,
    });

    const handleClick = (event: MouseEvent) => {
        if (!popoutRef.current || !outsideRef.current || !event.target) return;
        if (outsideRef.current.contains(event.target as Node) && !popoutRef.current.contains(event.target as Node)) {
            setPopout(false);
            setCurrentSelected(SIDE.NONE);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    useEffect(() => {
        ws.sendJsonMessage({
            type: WS_SIGNALS.UPDATE_TEAM,
            data: JSON.stringify(controllerState.team)
        })
    }, [controllerState.team.left, controllerState.team.right])

    return (
        <>
            <Head>
                <title>Narukami Controller</title>
                <meta name="description" content="Master Controller for Narukami Tournament" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/Logo.svg" />
            </Head>
            <div className="App">
                <div className="controller">
                    <div className="leftCol">
                        <div className="logo"></div>
                        <button
                            className={`${mm.className} left`}
                            onClick={() => {
                                setPopout(true);
                                setCurrentSelected(SIDE.LEFT);
                            }}
                        >
                            <div
                                className="teamIconButton"
                                style={{
                                    backgroundImage: `url(${teams_.teams[controllerState.team.left].avatar})`,
                                }}
                            ></div>
                            {teams_.teams[controllerState.team.left].name}
                        </button>
                        <button
                            className={`${mm.className} right`}
                            onClick={() => {
                                setPopout(true);
                                setCurrentSelected(SIDE.RIGHT);
                            }}
                        >
                            <div
                                className="teamIconButton"
                                style={{
                                    backgroundImage: `url(${teams_.teams[controllerState.team.right].avatar})`,
                                }}
                            ></div>
                            {teams_.teams[controllerState.team.right].name}
                        </button>
                    </div>
                    <div className="rightCol">
                        <div className="section">
                            <div className="label">Idle Mode</div>
                            <input
                                type="checkbox"
                                onChange={(event) => {
                                    controllerDispatcher({
                                        type: ACTION_TYPE.SWITCH_STATE,
                                        data: {
                                            ...controllerState.state,
                                            idle: event.target.checked,
                                        },
                                    });
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.SWITCH_IDLE,
                                        data: event.target.checked,
                                    });
                                }}
                            />
                        </div>
                        <div className="section">
                            <div className="label">Accept Random</div>
                            <input
                                type="checkbox"
                                onChange={(event) => {
                                    controllerDispatcher({
                                        type: ACTION_TYPE.SWITCH_STATE,
                                        data: {
                                            ...controllerState.state,
                                            acceptRand: event.target.checked,
                                        },
                                    });
                                }}
                            />
                        </div>
                        <div className="section">
                            <div className="label">Round</div>
                            <div className="roundSwitch">
                                <button
                                    onClick={() => {
                                        if (controllerState.round === 0) return;

                                        controllerDispatcher({
                                            type: ACTION_TYPE.CHANGE_ROUND,
                                            data: controllerState.round - 1,
                                        });

                                        ws.sendJsonMessage({
                                            type: WS_SIGNALS.CHANGE_BAN_LIMIT,
                                            data: roundList[controllerState.round - 1].nBans,
                                        });
                                    }}
                                >
                                    -
                                </button>
                                <div className="roundName">{roundList[controllerState.round].name}</div>
                                <button
                                    onClick={() => {
                                        if (controllerState.round === roundList.length - 1) return;

                                        controllerDispatcher({
                                            type: ACTION_TYPE.CHANGE_ROUND,
                                            data: controllerState.round + 1,
                                        });
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="buttonList">
                            <button
                                className={`${mm.className} signal`}
                                onClick={() => {
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.START_SIGNALING,
                                    });
                                }}
                            >
                                <img src="/stopwatch.png" />
                                Start Ban / Pick
                            </button>
                            <button className={`${mm.className} random`}>
                                <img src="/random.png" />
                                Random Pick
                            </button>
                            <button className={`${mm.className} ban`}>
                                <img src="/ban.png" />
                                Reveal Ban
                            </button>
                            <button className={`${mm.className} pick`}>
                                <img src="/pick.png" />
                                Reveal Pick
                            </button>
                            <button
                                className={`${mm.className} shuffle`}
                                onClick={() => {
                                    const randomized: MapState[] = random(roundList[controllerState.round].limit).map((map) => {
                                        const mapState: MapState = {
                                            artist: map.map.artist,
                                            title: map.map.title,
                                            type: map.diff,
                                            lvl: map.lvl,
                                            version: map.version,
                                            image: map.map.image_url,
                                            state: PHASE.NONE,
                                        };

                                        return mapState
                                    });
                                    console.log(randomized);

                                    controllerDispatcher({
                                        type: ACTION_TYPE.LOAD_MAPS,
                                        data: randomized,
                                    });

                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.SHUFFLE,
                                        data: JSON.stringify(randomized)
                                    })
                                }}
                            >
                                <img src="/osu.png" />
                                Shuffle!
                            </button>
                            <button
                                className={`${mm.className} reset`}
                                onClick={() => {
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.RESET,
                                    });
                                }}
                            >
                                <img src="/reset.png" />
                                RESET
                            </button>
                        </div>
                    </div>
                </div>
                {popout ? (
                    <div className="popoutContainer" ref={outsideRef}>
                        <div className="popout" ref={popoutRef}>
                            <div className="header">
                                <div className="title">Select team for {currentSelected} side</div>
                                <button
                                    className={mm.className}
                                    onClick={() => {
                                        setPopout(false);
                                        setCurrentSelected(SIDE.NONE);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="teamList">
                                {teams_.teams.map((team, idx) => {
                                    return (
                                        <div
                                            className="team"
                                            key={idx}
                                            onClick={() => {
                                                controllerDispatcher({
                                                    type: ACTION_TYPE.SET_TEAM,
                                                    data: {
                                                        side: currentSelected,
                                                        team: idx,
                                                    },
                                                });
                                                setPopout(false);
                                                setCurrentSelected(SIDE.NONE);
                                            }}
                                        >
                                            <div
                                                className="teamIcon"
                                                style={{
                                                    backgroundImage: `url(${team.avatar})`,
                                                }}
                                            ></div>
                                            <div className="teamName">{team.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    ""
                )}

                <style jsx>{`
                    .App {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100vw;
                        height: 100vh;

                        background-image: linear-gradient(0deg, #3d313b, #593e44);

                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .controller {
                        position: relative;
                        width: 60%;
                         {
                            /* height: 50%; */
                        }

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;

                        display: flex;
                    }

                    .leftCol {
                        width: 40%;
                         {
                            /* height: 100%; */
                        }

                        padding: 30px;

                        display: flex;
                        flex-direction: column;
                        justify-content: start;
                        align-items: center;
                        gap: 20px;

                        border-right: solid 2px rgba(255 255 255 /0.2);
                    }

                    .logo {
                        width: 60%;
                        aspect-ratio: 1 / 1;

                        background-image: url(/Logo.png);
                        background-size: 60%;
                        background-position: center;
                        background-repeat: no-repeat;
                    }

                    .leftCol button {
                        appearance: none;
                        border: none;
                        background: none;

                        width: 100%;
                        height: 100px;

                        padding: 20px;

                        font-size: 18px;
                        font-weight: 600;

                        border-radius: 10px;

                        user-select: none;

                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;

                        display: flex;
                        align-items: center;
                        gap: 30px;
                    }

                    .leftCol button:active {
                        opacity: 0.5;
                    }

                    .leftCol button.left:hover {
                        background-image: linear-gradient(90deg, rgba(180, 146, 128, 1) 0%, rgba(190, 121, 156, 1) 100%);
                    }

                    .leftCol button.right:hover {
                        background-image: linear-gradient(90deg, rgb(72, 195, 204) 0%, rgb(89, 154, 214) 100%);
                    }

                    .leftCol button.left {
                        background-image: linear-gradient(90deg, rgba(123, 89, 118, 1) 0%, rgba(119, 86, 93, 1) 100%);
                    }

                    .leftCol button.right {
                        background-image: linear-gradient(90deg, rgb(49, 90, 167) 0%, rgb(64, 152, 179) 100%);
                    }

                    .teamIconButton {
                        height: 100%;
                        aspect-ratio: 1 / 1;

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;

                        background-size: cover;
                        background-position: center;
                    }

                    .rightCol {
                        flex: 1;
                        height: 100%;

                        padding: 30px;

                        font-size: 18px;

                        display: flex;
                        flex-direction: column;
                        gap: 25px;
                    }

                    .section {
                        width: 100%;

                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .section input[type="checkbox"] {
                        position: relative;
                        appearance: none;

                        width: 50px;
                        height: 20px;

                        opacity: 0.5;
                        transition: ease-in-out 200ms;
                    }

                    .section input[type="checkbox"]:checked {
                        opacity: 1;
                    }

                    .section input[type="checkbox"]:before {
                        content: "";
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;

                        margin: auto 0;

                        width: 100%;
                        height: 20px;

                         {
                            /* background: red; */
                        }
                        border-radius: 20px;
                        outline: solid 4px #f5cdd7;
                    }

                    .section input[type="checkbox"]:after {
                        content: "";
                        position: absolute;

                        top: 0;
                        bottom: 0;
                        left: 5px;

                        width: 10px;
                        height: 10px;

                        margin: auto 0;

                        background: #f5cdd7;
                        border-radius: 10px;

                        transition: ease-in-out 200ms;
                    }

                    .section input[type="checkbox"]:checked:after {
                        left: 35px;
                    }

                    .section input[type="number"] {
                        width: 50px;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 10px;

                        background-color: rgba(0 0 0 /0.5);
                        font-size: 16px;
                        text-align: center;
                    }

                    .section input[type="number"]:focus {
                        outline: solid 2px #eebe76;
                    }

                    .roundSwitch {
                        width: 250px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                    }

                    .roundSwitch button {
                        width: 20px;
                        height: 20px;

                        border: none;
                        background: transparent;

                        outline: solid 2px white;
                        color: white;

                        border-radius: 10px;
                    }

                    .buttonList {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }

                    .buttonList button {
                        appearance: none;
                        border: none;

                        width: 1fr;

                        padding: 20px;

                        font-size: 18px;
                        font-weight: 600;

                        border-radius: 10px;

                        user-select: none;

                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;

                        background-image: linear-gradient(90deg, rgba(123, 89, 118, 1) 0%, rgba(119, 86, 93, 1) 100%);

                        display: flex;
                        justify-content: center;
                        align-content: center;
                        align-items: center;
                        gap: 20px;
                    }

                    .buttonList button:hover {
                        background-image: linear-gradient(90deg, rgba(180, 146, 128, 1) 0%, rgba(190, 121, 156, 1) 100%);
                    }

                    .buttonList button.reset {
                        grid-column: 1 / span 2;
                        background-image: linear-gradient(90deg, rgb(184, 60, 97) 0%, rgb(235, 34, 61) 100%);
                    }

                    .buttonList button.reset:hover {
                        background-image: linear-gradient(90deg, rgb(223, 83, 160) 0%, rgb(233, 79, 100) 100%);
                    }

                    .buttonList button.shuffle {
                        grid-column: 1 / span 2;
                        background-image: linear-gradient(90deg, rgb(49, 90, 167) 0%, rgb(64, 152, 179) 100%);
                    }

                    .buttonList button.shuffle:hover {
                        background-image: linear-gradient(90deg, rgb(72, 195, 204) 0%, rgb(89, 154, 214) 100%);
                    }

                    .popoutContainer {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100%;
                        height: 100%;

                        display: flex;
                        justify-content: center;
                        align-items: center;

                        background-color: rgba(0 0 0 /0.5);
                    }

                    .popout {
                        width: 60%;

                        padding: 30px;

                        border-radius: 10px;

                        background-image: linear-gradient(0deg, #3d313b, #593e44);

                        display: flex;
                        gap: 20px;
                        flex-direction: column;
                    }

                    .header {
                        width: 100%;

                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        font-size: 24px;
                        font-weight: 600;
                    }

                    .popout button {
                        appearance: none;
                        border: none;

                        padding: 10px 20px;

                        font-size: 14px;
                        font-weight: 600;

                        border-radius: 10px;

                        user-select: none;

                        background-color: rgba(0 0 0 /0.5);
                    }

                    .popout button:hover {
                        background-color: rgba(255 255 255 /0.2);
                    }

                    .teamList {
                        width: 100%;
                        flex: 1;

                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        align-content: flex-start;
                    }

                    .team {
                        width: 1fr;
                        height: 80px;

                        padding: 20px;

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;

                        display: flex;
                        align-items: center;
                        gap: 20px;

                        overflow: hidden;
                        user-select: none;
                    }

                    .team:hover {
                        background-color: rgba(255 255 255 /0.2);
                    }

                    .teamIcon {
                        height: 100%;
                        aspect-ratio: 1 / 1;

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;
                        background-size: cover;
                        background-position: center;
                    }

                    .teamName {
                        font-size: 12px;

                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                `}</style>
            </div>
        </>
    );
};

export default Controller;
