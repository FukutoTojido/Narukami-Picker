import { useEffect, useReducer } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

import styles from "../../styles/Picker.module.css"

enum PHASE {
    BAN,
    PICK,
}

enum CHART_DIFF {
    BASIC,
    ADVANCED,
    EXPERT,
    MASTER,
    RE_MASTER,
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
    state: PHASE;
}

interface MainState {
    phase: PHASE;
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

const initialState: MainState = {
    phase: PHASE.BAN,
    maps: [],
};

const reducer = (state: MainState, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.LOAD_MAPS: {
            state.maps = action.data!;
            return state;
        }
        case ACTION_TYPE.SET_MAP: {
            state.maps[action.data!.idx].state = action.data.state;
            return state;
        }
        case ACTION_TYPE.RESET: {
            return initialState;
        }
        case ACTION_TYPE.CHANGE_PHASE: {
            state.phase = action.data;
            return state;
        }
    }
};

const Picker = () => {
    const [pickerState, pickerDispatch] = useReducer(reducer, initialState);
    return <div className="App"></div>;
};

export default Picker;
