import { NullLiteral } from "typescript";

enum VERSION {
    DX = "DX",
    STANDARD = "STANDARD",
}

enum PHASE {
    BAN = "BAN",
    PICK = "PICK",
    NONE = "NONE",
    LOCK = "LOCK",
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
    LOCK_ALL,
    UPDATE_MAPPOOL,
    UPDATE_NAME,
    IDLE,
    SET_TEAM,
    CHANGE_BAN_LIMIT,
    SWITCH_STATE,
    CHANGE_ROUND,
    START_SIGNALING,
    RANDOM,
    UPDATE_SCORE,
    UPDATE_ROUND,
}

enum SIDE {
    LEFT = "left",
    RIGHT = "right",
    NONE = "",
}

interface User {
    id: string;
    team: string;
    tournament: string;
    user: UserGame;
    game: string;
    username: string;
    avatar: string;
    rating: number;
    rating_max: number;
    course: string;
    class: string;
    stars: number;
    title: string;
    created_time: string;
    updated_time: string;
}

interface UserGame {
    id: string;
    user_id: number;
    username: string;
    avatar: string;
    country: string;
    oauth: {
        discord: {
            user_id: string;
            username: string;
            avatar: string;
        };
    };
    games: [
        {
            game: string;
            username: string;
            rating: number;
            rating_max: number;
            course: string;
            class: string;
            stars: number;
            title: string;
        }
    ];
    registered_time: string;
    last_login: string;
}

interface TeamName {
    left: number | string;
    right: number | string;
}

interface MapState {
    artist: string;
    title: string;
    name?: {
        orig: string;
        romaji: string;
        eng: string;
        alias: string[] | null;
    };
    lvl: string;
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
        all: boolean;
        idle: boolean;
    };
    maps: MapState[];
}

interface MappoolState {
    team: TeamName;
    maps: BanPickState;
    picked: {
        left: MapState[];
        right: MapState[];
    };
    round: number;
}

interface State {
    idle: boolean;
    acceptRand: boolean;
}

interface BanPickState {
    bans: {
        left: (MapState | null)[];
        right: (MapState | null)[];
    };
    picks: {
        left: MapState | null;
        right: MapState | null;
    };
    random: MapState | null;
    secret?: MapState | null;
}

interface ControllerState {
    team: TeamName;
    round: number;
    maps: BanPickState;
    state: State;
    phase: PHASE;
}

interface SetMap {
    type: ACTION_TYPE.SET_MAP;
    data: {
        bans: {
            left: (MapState | null)[];
            right: (MapState | null)[];
        };
        picks: {
            left: MapState | null;
            right: MapState | null;
        };
        random: MapState | null;
        secret?: MapState | null;
    };
}

interface ChangeBanLimit {
    type: ACTION_TYPE.CHANGE_BAN_LIMIT;
    data: number;
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

interface LockAll {
    type: ACTION_TYPE.LOCK_ALL;
    data: boolean;
}

interface Idle {
    type: ACTION_TYPE.IDLE;
    data: boolean;
}

interface UpdateMappool {
    type: ACTION_TYPE.UPDATE_MAPPOOL;
    data: BanPickState;
}

interface UpdateName {
    type: ACTION_TYPE.UPDATE_NAME;
    data: TeamName;
}

interface SetTeam {
    type: ACTION_TYPE.SET_TEAM;
    data: {
        side: SIDE;
        team: number;
    };
}

interface SwitchState {
    type: ACTION_TYPE.SWITCH_STATE;
    data: State;
}

interface ChangeRound {
    type: ACTION_TYPE.CHANGE_ROUND;
    data: number;
}

interface StartSignaling {
    type: ACTION_TYPE.START_SIGNALING;
}

interface Random {
    type: ACTION_TYPE.RANDOM;
    data: MapState[];
}

interface UpdateScore {
    type: ACTION_TYPE.UPDATE_SCORE;
    data: {
        left: number;
        right: number;
    };
}

interface UpdateRound {
    type: ACTION_TYPE.UPDATE_ROUND;
    data: number;
}

interface MapData {
    artist: string;
    catcode: string;
    dx_lev_bas: string | null;
    dx_lev_adv: string | null;
    dx_lev_exp: string | null;
    dx_lev_mas: string | null;
    dx_lev_remas: string | null;
    image_url: string;
    release: string;
    lev_bas: string | null;
    lev_adv: string | null;
    lev_exp: string | null;
    lev_mas: string | null;
    lev_remas: string | null;
    sort: string;
    title: string;
    title_kana: string;
    version: string;
    idx: {
        dx: string | null;
        sta: string | null;
    };
    name?: {
        orig: string;
        romaji: string;
        eng: string;
        alias: string[] | null;
    };
}

interface FilteredMapData {
    map: MapData;
    version: VERSION;
    diff: CHART_DIFF;
    lvl: string;
}

type Action =
    | SetMap
    | LoadMaps
    | Reset
    | ChangePhase
    | LockAll
    | UpdateMappool
    | UpdateName
    | Idle
    | SetTeam
    | ChangeBanLimit
    | SwitchState
    | ChangeRound
    | StartSignaling
    | Random
    | UpdateScore
    | UpdateRound;

export type { MapState, MainState, Action, MappoolState, TeamName, ControllerState, FilteredMapData, User, MapData, BanPickState };
export { VERSION, PHASE, CHART_DIFF, ACTION_TYPE, SIDE };
