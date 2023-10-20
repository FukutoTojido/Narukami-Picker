"use client";

import "./style.css";

import Head from "next/head";
import type { Metadata } from "next";

import { useReducer, useState, useRef, useEffect, useContext, createContext } from "react";
import { MuseoModerno } from "next/font/google";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

import { ControllerState, Action, SIDE, ACTION_TYPE, VERSION, CHART_DIFF, FilteredMapData, PHASE, MapState, MapData } from "@/types/types";
import { WsAction, WS_SIGNALS } from "@/types/ws";

import teams_ from "../../json/teams_.json";
import songs from "../../json/merged.json";

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

const getDiff = (diff: string) => {
    return songs.reduce((accumulated: FilteredMapData[], map) => {
        const sameSetFiltering: FilteredMapData[] = [];
        if (map.dx_lev_remas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.RE_MASTER,
                lvl: map.dx_lev_remas,
            } as FilteredMapData);
        if (map.dx_lev_mas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.MASTER,
                lvl: map.dx_lev_mas,
            } as FilteredMapData);
        if (map.dx_lev_exp === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.DX,
                diff: CHART_DIFF.EXPERT,
                lvl: map.dx_lev_exp,
            } as FilteredMapData);
        if (map.lev_remas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.RE_MASTER,
                lvl: map.lev_remas,
            } as FilteredMapData);
        if (map.lev_mas === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.MASTER,
                lvl: map.lev_mas,
            } as FilteredMapData);
        if (map.lev_exp === diff)
            sameSetFiltering.push({
                map,
                version: VERSION.STANDARD,
                diff: CHART_DIFF.EXPERT,
                lvl: map.lev_exp,
            } as FilteredMapData);
        return accumulated.concat(sameSetFiltering);
    }, []);
};

const getDiffRange = (limitList: string[]) => {
    const min = getDiff(limitList[0]);
    const max = getDiff(limitList[1]);

    return min.concat(max);
};

const mm = MuseoModerno({
    subsets: ["latin"],
});

const initialState: ControllerState = {
    team: {
        left: 0,
        right: 1,
    },
    round: 0,
    maps: {
        bans: {
            left: [...Array(roundList[0].nBans)].map(() => null),
            right: [...Array(roundList[0].nBans)].map(() => null),
        },
        picks: {
            left: null,
            right: null,
        },
        random: null,
        secret: null,
    },
    state: {
        idle: false,
        acceptRand: false,
    },
    phase: PHASE.BAN,
};

const reducer = (state: ControllerState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_TEAM: {
            if (action.data.side === SIDE.LEFT) state.team.left = action.data.team;
            if (action.data.side === SIDE.RIGHT) state.team.right = action.data.team;

            return { ...state };
        }
        case ACTION_TYPE.SWITCH_STATE: {
            // state.state = action.data;
            return { ...state, state: action.data };
        }
        case ACTION_TYPE.CHANGE_ROUND: {
            // state.round = action.data;
            return {
                ...state,
                round: action.data,
                maps: {
                    bans: {
                        left: [...Array(roundList[action.data].nBans)].map(() => null),
                        right: [...Array(roundList[action.data].nBans)].map(() => null),
                    },
                    picks: {
                        left: null,
                        right: null,
                    },
                    random: null,
                    secret: null,
                },
            };
        }
        case ACTION_TYPE.LOAD_MAPS: {
            // console.log(action.data);
            // state.maps = action.data;
            // return { ...state, maps: action.data };
            return { ...state };
        }
        case ACTION_TYPE.SET_MAP: {
            return { ...state, maps: action.data };
        }
        case ACTION_TYPE.CHANGE_PHASE: {
            return { ...state, phase: action.data };
        }
        case ACTION_TYPE.RANDOM: {
            return { ...state, random: action.data };
        }
        case ACTION_TYPE.RESET: {
            return {
                ...state,
                maps: {
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
                },
            };
        }
        default: {
            return { ...state };
        }
    }
};

const WS_URL = "wss://express.satancraft.net:443/ws";
// const WS_URL = "ws://localhost:9727/ws";

const MapNode = ({ data, side }: { data: MapState | null; side?: SIDE }) => {
    return data ? (
        <div
            className="mapNode"
            style={{
                backgroundImage: `linear-gradient(-90deg, ${
                    side ? (side === SIDE.LEFT ? "#f23a6599" : "#3aa6f299") : "rgba(127, 109, 116, 1)"
                } 20%, rgba(0 0 0 / .7)), url(https://maimaidx-eng.com/maimai-mobile/img/Music/${data.image})`,
            }}
        >
            <div
                className="mapCover"
                style={{
                    backgroundImage: `url(https://maimaidx-eng.com/maimai-mobile/img/Music/${data.image})`,
                }}
            ></div>
            <div className="metadata">
                <div className="title">{data.title}</div>
                <div className="artist">{data.artist}</div>
                <div className={`type ${data.type === CHART_DIFF.RE_MASTER ? "REMAS" : data.type}`}>{data.type}</div>
            </div>
            <div
                className="version"
                style={{
                    backgroundImage: `url(/${data.version}.png)`,
                }}
            ></div>
            <div className="level">
                Lv<span>{data.lvl}</span>
            </div>
            <div className={`state ${PHASE.NONE}`}></div>
        </div>
    ) : (
        <div className="mapNode"></div>
    );
};

const PageContext = createContext<any>(null);

const Page = () => {
    const [controllerState, controllerDispatcher] = useReducer(reducer, initialState);
    const [popout, setPopout] = useState(false);
    const [currentSelected, setCurrentSelected] = useState<any>(null);
    const popoutRef = useRef<HTMLDivElement>(null);
    const outsideRef = useRef<HTMLDivElement>(null);
    const inputRefLeft = useRef<HTMLInputElement>(null);
    const inputRefRight = useRef<HTMLInputElement>(null);
    const nameRefLeft = useRef<HTMLInputElement>(null);
    const nameRefRight = useRef<HTMLInputElement>(null);
    const modelRef = useRef<HTMLDialogElement>(null);
    const [currentMapList, setCurrentMapList] = useState<MapState[]>([]);
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const ws = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connected!");
        },
        onMessage: (event) => {
            const mes = JSON.parse(event.data);

            switch (mes.type) {
            }
        },
        shouldReconnect: (closedEvent) => true,
    });

    const handleClick = (event: MouseEvent) => {};

    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setPopout(false);
            setCurrentSelected(null);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    useEffect(() => {
        ws.sendJsonMessage({
            type: WS_SIGNALS.UPDATE_TEAM,
            data: JSON.stringify(controllerState.team),
        });
    }, [controllerState.team.left, controllerState.team.right]);

    useEffect(() => {
        if (modelRef.current) {
            if (popout) modelRef.current.showModal();
            else modelRef.current.close();
        }

        if (popout) searchRef.current?.focus();
    }, [popout]);

    useEffect(() => {
        const mapList = getDiffRange(roundList[controllerState.round].limit)
            .map((mapData) => {
                return {
                    artist: mapData.map.artist,
                    title: mapData.map.title,
                    name: mapData.map.name,
                    type: mapData.diff,
                    lvl: mapData.lvl,
                    version: mapData.version,
                    image: mapData.map.image_url,
                    state: PHASE.NONE,
                };
            })
            .filter((map) => {
                return (
                    map.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    map.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    map.name!.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    map.name!.eng.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    map.name!.alias?.map((alias) => alias.toLowerCase().includes(searchTerm.toLowerCase())).some((ele) => ele)
                );
            });

        setCurrentMapList(mapList);
    }, [controllerState.round, searchTerm]);

    useEffect(() => {
        ws.sendJsonMessage({
            type: WS_SIGNALS.UPDATE_MAPPOOL,
            data: JSON.stringify(controllerState.maps),
        });
    }, [JSON.stringify(controllerState.maps)]);

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
                        <div className="section">
                            <div className="label">Left Team</div>
                            <input
                                type="text"
                                className={`${mm.className}`}
                                ref={nameRefLeft}
                                onBlur={() => {
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.UPDATE_NAME,
                                        data: JSON.stringify({
                                            left: nameRefLeft.current?.value ?? "",
                                            right: nameRefRight.current?.value ?? "",
                                        }),
                                    });
                                }}
                            />
                        </div>
                        <div className="section">
                            <div className="label">Right Team</div>
                            <input
                                type="text"
                                className={`${mm.className}`}
                                ref={nameRefRight}
                                onBlur={() => {
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.UPDATE_NAME,
                                        data: JSON.stringify({
                                            left: nameRefLeft.current?.value ?? "",
                                            right: nameRefRight.current?.value ?? "",
                                        }),
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="middleCol">
                        <div className="mapList">
                            <div className="label">Ban List</div>
                            <div className="banList list">
                                <div className="left">
                                    {controllerState.maps.bans.left.map((map: MapState | null, idx) => {
                                        return (
                                            <button
                                                onClick={(event) => {
                                                    setCurrentSelected({
                                                        side: SIDE.LEFT,
                                                        phase: PHASE.BAN,
                                                        idx,
                                                    });
                                                    setPopout(true);
                                                    (event.target as HTMLButtonElement).blur();
                                                }}
                                                onContextMenu={(event) => {
                                                    event.preventDefault();
                                                    const clone = structuredClone(controllerState);

                                                    clone.maps.bans.left[idx] = null;

                                                    controllerDispatcher({
                                                        type: ACTION_TYPE.SET_MAP,
                                                        data: clone.maps!,
                                                    });
                                                }}
                                                className={mm.className}
                                                key={idx}
                                            >
                                                <MapNode data={map} side={SIDE.LEFT} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="right">
                                    {controllerState.maps.bans.right.map((map: MapState | null, idx) => {
                                        return (
                                            <button
                                                onClick={(event) => {
                                                    setCurrentSelected({
                                                        side: SIDE.RIGHT,
                                                        phase: PHASE.BAN,
                                                        idx,
                                                    });
                                                    setPopout(true);
                                                    (event.target as HTMLButtonElement).blur();
                                                }}
                                                onContextMenu={(event) => {
                                                    event.preventDefault();
                                                    const clone = structuredClone(controllerState);

                                                    clone.maps.bans.right[idx] = null;

                                                    controllerDispatcher({
                                                        type: ACTION_TYPE.SET_MAP,
                                                        data: clone.maps!,
                                                    });
                                                }}
                                                className={mm.className}
                                                key={idx}
                                            >
                                                <MapNode data={map} side={SIDE.RIGHT} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="label">Pick List</div>
                            <div className="pickList list">
                                <div className="left">
                                    <button
                                        onClick={(event) => {
                                            setCurrentSelected({
                                                side: SIDE.LEFT,
                                                phase: PHASE.PICK,
                                            });
                                            setPopout(true);
                                            (event.target as HTMLButtonElement).blur();
                                        }}
                                        onContextMenu={(event) => {
                                            event.preventDefault();
                                            const clone = structuredClone(controllerState);

                                            clone.maps.picks.left = null;

                                            controllerDispatcher({
                                                type: ACTION_TYPE.SET_MAP,
                                                data: clone.maps!,
                                            });
                                        }}
                                        className={mm.className}
                                    >
                                        <MapNode data={controllerState.maps.picks.left} side={SIDE.LEFT} />
                                    </button>
                                </div>
                                <div className="right">
                                    <button
                                        onClick={(event) => {
                                            setCurrentSelected({
                                                side: SIDE.RIGHT,
                                                phase: PHASE.PICK,
                                            });
                                            setPopout(true);
                                            (event.target as HTMLButtonElement).blur();
                                        }}
                                        onContextMenu={(event) => {
                                            event.preventDefault();
                                            const clone = structuredClone(controllerState);

                                            clone.maps.picks.right = null;

                                            controllerDispatcher({
                                                type: ACTION_TYPE.SET_MAP,
                                                data: clone.maps!,
                                            });
                                        }}
                                        className={mm.className}
                                    >
                                        <MapNode data={controllerState.maps.picks.right} side={SIDE.RIGHT} />
                                    </button>
                                </div>
                            </div>
                            <div className="label">Random</div>
                            <button
                                className={`${mm.className} wrapper`}
                                onContextMenu={(event) => {
                                    event.preventDefault();
                                    const clone = structuredClone(controllerState);

                                    clone.maps.random = null;

                                    controllerDispatcher({
                                        type: ACTION_TYPE.SET_MAP,
                                        data: clone.maps!,
                                    });
                                }}
                            >
                                <MapNode data={controllerState.maps.random} />
                            </button>
                        </div>
                    </div>
                    <div className="rightCol">
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

                                        ws.sendJsonMessage({
                                            type: WS_SIGNALS.UPDATE_ROUND,
                                            data: roundList[controllerState.round - 1].name,
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

                                        ws.sendJsonMessage({
                                            type: WS_SIGNALS.CHANGE_BAN_LIMIT,
                                            data: roundList[controllerState.round + 1].nBans,
                                        });

                                        ws.sendJsonMessage({
                                            type: WS_SIGNALS.UPDATE_ROUND,
                                            data: roundList[controllerState.round + 1].name,
                                        });
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="buttonList">
                            <button
                                className={`${mm.className} random`}
                                onClick={() => {
                                    const clone = structuredClone(controllerState);

                                    clone.maps.random = currentMapList
                                        .filter((map) => {
                                            const bool =
                                                (!controllerState.maps.bans.left.some((banMap) => banMap?.title === map.title) ?? true) &&
                                                (!controllerState.maps.bans.right.some((banMap) => banMap?.title === map.title) ?? true) &&
                                                (controllerState.maps.picks.left?.title !== map.title ?? true) &&
                                                (controllerState.maps.picks.right?.title !== map.title ?? true);

                                            return bool;
                                        })
                                        .sort((ele) => 0.5 - Math.random())[0];

                                    console.log(clone.maps.random);

                                    controllerDispatcher({
                                        type: ACTION_TYPE.SET_MAP,
                                        data: clone.maps!,
                                    });
                                }}
                            >
                                <img src="/random.png" />
                                Random Pick
                            </button>
                            <button
                                className={`${mm.className} reset`}
                                onClick={() => {
                                    controllerDispatcher({
                                        type: ACTION_TYPE.RESET,
                                    });
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.RESET,
                                    });

                                    if (inputRefLeft.current) inputRefLeft.current.value = "0";
                                    if (inputRefRight.current) inputRefRight.current.value = "0";

                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.UPDATE_SCORE,
                                        data: JSON.stringify({
                                            left: 0,
                                            right: 0,
                                        }),
                                    });
                                }}
                            >
                                <img src="/reset.png" />
                                RESET
                            </button>
                        </div>
                        <div className="scoreContainer">
                            <div className="section">
                                <div className="label">Left Team Score</div>
                                <input type="number" className={`${mm.className}`} defaultValue={0.0} ref={inputRefLeft} />
                            </div>
                            <div className="section">
                                <div className="label">Right Team Score</div>
                                <input type="number" className={`${mm.className}`} defaultValue={0.0} ref={inputRefRight} />
                            </div>
                            <button
                                className={`${mm.className}`}
                                onClick={() => {
                                    // console.log(inputRefLeft.current?.value, inputRefRight.current?.value);
                                    ws.sendJsonMessage({
                                        type: WS_SIGNALS.UPDATE_SCORE,
                                        data: JSON.stringify({
                                            left: parseFloat(inputRefLeft.current?.value ?? "0"),
                                            right: parseFloat(inputRefRight.current?.value ?? "0"),
                                        }),
                                    });
                                }}
                            >
                                Change Score
                            </button>
                        </div>
                    </div>
                    <dialog ref={modelRef}>
                        <div className="mapSearch">
                            <div className="header">
                                <div className="levels">
                                    Currently showing maps from LVL {roundList[controllerState.round].limit[0]} to{" "}
                                    {roundList[controllerState.round].limit[1]}
                                </div>
                                <button
                                    onClick={() => {
                                        setPopout(false);
                                        setCurrentSelected(null);
                                        setSearchTerm("");
                                        if (searchRef.current) searchRef.current.value = "";
                                    }}
                                >
                                    <div className="closeButton"></div>
                                </button>
                            </div>

                            <input
                                type="text"
                                className={`searchBar ${mm.className}`}
                                ref={searchRef}
                                onChange={() => {
                                    if (searchRef.current) {
                                        setSearchTerm(searchRef.current.value);
                                    }
                                }}
                            />
                            <PageContext.Provider
                                value={{
                                    controllerState,
                                    controllerDispatcher,
                                    currentSelected,
                                    setCurrentSelected,
                                    setPopout,
                                    setSearchTerm,
                                    searchRef,
                                }}
                            >
                                <Pagination list={currentMapList} />
                            </PageContext.Provider>
                        </div>
                    </dialog>
                </div>
            </div>
        </>
    );
};

const Pagination = ({ list }: { list: MapState[] }) => {
    const { controllerState, controllerDispatcher, currentSelected, setCurrentSelected, setPopout, setSearchTerm, searchRef } =
        useContext(PageContext);
    const [page, setPage] = useState(0);
    const [segmentedList, setSegmentedList] = useState<MapState[]>([]);

    useEffect(() => {
        setSegmentedList(list.slice(page * 12, Math.min(page * 12 + 12, list.length)));
    }, [page, list.length]);

    useEffect(() => {
        setPage(0);
    }, [list.length]);

    return (
        <>
            <div className="result">
                {segmentedList.map((mapData, idx) => {
                    return (
                        <button
                            key={idx}
                            className={mm.className}
                            onClick={() => {
                                const clone = structuredClone(controllerState);

                                if (currentSelected.phase === PHASE.BAN) {
                                    if (currentSelected.side === SIDE.LEFT) {
                                        clone.maps.bans.left[currentSelected.idx] = mapData;
                                    } else {
                                        clone.maps.bans.right[currentSelected.idx] = mapData;
                                    }
                                }

                                if (currentSelected.phase === PHASE.PICK) {
                                    if (currentSelected.side === SIDE.LEFT) {
                                        clone.maps.picks.left = mapData;
                                    } else {
                                        clone.maps.picks.right = mapData;
                                    }
                                }

                                controllerDispatcher({
                                    type: ACTION_TYPE.SET_MAP,
                                    data: clone.maps,
                                });

                                setCurrentSelected(null);
                                setSearchTerm("");
                                setPopout(false);
                                if (searchRef.current) searchRef.current.value = "";
                            }}
                        >
                            <MapNode data={mapData} />
                        </button>
                    );
                })}
            </div>
            <div className="navigator">
                <div className="indicator">
                    Showing results from {page * 12 + 1} to {Math.min(page * 12 + 12, list.length)} of {list.length}
                </div>
                <button
                    onClick={() => {
                        setPage(Math.max(page - 1, 0));
                    }}
                >
                    <div className="back"></div>
                </button>
                <button
                    onClick={() => {
                        setPage(Math.min(page + 1, Math.ceil(list.length / 12) - 1));
                    }}
                >
                    <div className="forward"></div>
                </button>
            </div>
        </>
    );
};

export default Page;
