import { MapState, TeamName, SIDE } from "./types";

enum WS_SIGNALS {
    SWITCH_IDLE,
    CHANGE_BAN_LIMIT,
    REQ_RANDOM,
    START_SIGNALING,
    SHUFFLE,
    RESET,
    UPDATE_TEAM,
    POST_RESULT,
    SHOW_RESULT,
    UPDATE_MAPPOOL,
    UPDATE_RANDOM,
    UPDATE_SCORE,
    UPDATE_ROUND
}

interface SwitchIdle {
    type: WS_SIGNALS.SWITCH_IDLE;
    data: boolean;
}

interface AtomRequest {
    type: WS_SIGNALS.REQ_RANDOM | WS_SIGNALS.START_SIGNALING | WS_SIGNALS.RESET;
}

interface Shuffle {
    type: WS_SIGNALS.SHUFFLE;
    data: string;
}

interface ChangeBanLimit {
    type: WS_SIGNALS.CHANGE_BAN_LIMIT;
    data: number;
}

interface UpdateTeam {
    type: WS_SIGNALS.UPDATE_TEAM;
    data: TeamName;
}

interface PostResult {
    type: WS_SIGNALS.POST_RESULT;
    data: {
        side: SIDE.LEFT | SIDE.RIGHT;
        maps: MapState[];
    };
}

interface ShowResult {
    type: WS_SIGNALS.SHOW_RESULT;
    data: MapState[];
}

type WsAction = AtomRequest | SwitchIdle | ChangeBanLimit | UpdateTeam | PostResult | Shuffle | ShowResult;

export type { WsAction };
export { WS_SIGNALS };
