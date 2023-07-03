import { useEffect, useReducer } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { useRouter } from "next/router";

import { MuseoModerno } from "next/font/google";

const mm = MuseoModerno({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

enum VERSION {
    DX = "DX",
    STANDARD = "STANDARD",
}

enum PHASE {
    BAN = "BAN",
    PICK = "PICK",
    NONE = "NONE",
}

enum CHART_DIFF {
    BASIC = "BASIC",
    ADVANCED = "ADVANCED",
    EXPERT = "EXPERT",
    MASTER = "MASTER",
    RE_MASTER = "Re:MASTER",
}

enum ACTION_TYPE {
    SET_MAP,
    LOAD_MAPS,
    RESET,
    CHANGE_PHASE,
}

interface MapState {
    artist: string;
    title: string;
    lvl: number;
    type: CHART_DIFF;
    version: VERSION;
    image: string;
    state: PHASE;
}

interface MainState {
    phase: PHASE;
    max: {
        nBans: number;
        nPicks: number;
    };
    lock: {
        ban: boolean;
        pick: boolean;
    };
    maps: MapState[];
}

interface SetMap {
    type: ACTION_TYPE.SET_MAP;
    data: {
        idx: number;
        state: PHASE;
    };
}

interface Reset {
    type: ACTION_TYPE.RESET;
}

interface LoadMaps {
    type: ACTION_TYPE.LOAD_MAPS;
    data: MapState[];
}

interface ChangePhase {
    type: ACTION_TYPE.CHANGE_PHASE;
    data: PHASE;
}

type Action = SetMap | LoadMaps | Reset | ChangePhase;

const mapPlaceholder: MapState = {
    artist: "クレシェンドブルー [最上静香 (CV.田所あずさ)、北上麗花 (CV.平山笑美)、北沢志保 (CV.雨宮 天)、野々原 茜 (CV.小笠原早紀)、箱崎星梨花 (CV.麻倉もも)]",
    title: "Shooting Stars",
    lvl: 12,
    type: CHART_DIFF.MASTER,
    version: VERSION.DX,
    image: "56bf1cdcbbf097c9.png",
    state: PHASE.NONE,
};

const initialState: MainState = {
    phase: PHASE.BAN,
    max: {
        nBans: 2,
        nPicks: 1,
    },
    lock: {
        ban: false,
        pick: false,
    },
    maps: [
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
        { ...mapPlaceholder },
    ],
};

const reducer = (state: MainState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.LOAD_MAPS: {
            state.maps = action.data!;
            return { ...state };
        }
        case ACTION_TYPE.SET_MAP: {
            state.maps[action.data!.idx].state = action.data.state;
            state.lock.ban = state.maps.filter((map) => map.state === PHASE.BAN).length >= state.max.nBans;
            state.lock.pick = state.maps.filter((map) => map.state === PHASE.PICK).length >= state.max.nPicks;

            return { ...state };
        }
        case ACTION_TYPE.RESET: {
            return initialState;
        }
        case ACTION_TYPE.CHANGE_PHASE: {
            state.phase = action.data;
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

const Picker = () => {
    const [pickerState, pickerDispatch] = useReducer(reducer, initialState);
    const router = useRouter();

    return (
        <div className="App">
            <div className="leftCol">
                <div className="logo"></div>
                <div className="phaseChanger">
                    <div className="label">Current Phase</div>
                    <div className={`indicator ${pickerState.phase}`}>{pickerState.phase}</div>
                    <div className="label">Current Team</div>
                    <div className="indicator">{upFirstChar((router.query.side ?? "none") as string)} Team</div>
                </div>
                <button
                    className={mm.className}
                    onClick={() =>
                        pickerDispatch({
                            type: ACTION_TYPE.CHANGE_PHASE,
                            data: pickerState.phase === PHASE.BAN ? PHASE.PICK : PHASE.BAN,
                        })
                    }
                >
                    Switch Phase
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
                                    (pickerState.lock.pick && pickerState.phase === PHASE.PICK)
                                        ? "lock"
                                        : ""
                                }`}
                            ></div>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .App {
                    position: absolute;
                    top: 0;
                    left: 0;

                    width: 100vw;
                    height: 100vh;
                    padding: 20px;

                    background-image: linear-gradient(0deg, #3d313b, #593e44);
                    display: flex;
                    gap: 20px;
                }

                .logo {
                    width: 100%;
                    aspect-ratio: 1 / 1;

                    background-image: url(/Logo.png);
                    background-size: 60%;
                    background-position: center;
                    background-repeat: no-repeat;
                }

                .leftCol {
                    width: 30%;

                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .phaseChanger {
                    width: 100%;
                    padding: 20px;

                    display: flex;
                    flex-direction: column;

                    background: rgba(0 0 0 / 0.5);
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
            `}</style>
        </div>
    );
};

export default Picker;
