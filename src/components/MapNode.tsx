import { MapState } from "@/types/types";
import { VERSION, PHASE, CHART_DIFF, ACTION_TYPE } from "@/types/types";

const MapNode = (props: { map: MapState | undefined }) => {
    if (!props.map) {
        return (
            <div className="mapNode">
                <style jsx>{`
                    .mapNode {
                        position: relative;
                        width: 100%;
                        height: 84px;

                        border-radius: 10px;

                        background-color: rgba(0 0 0 / 0.5);
                        overflow: hidden;

                        padding: 10px;

                        display: flex;
                        gap: 10px;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="mapNode">
            <div
                className="background"
                style={{
                    backgroundImage: `linear-gradient(-90deg, rgba(127, 109, 116, 1) 20%, rgba(127, 109, 116, .4)), url(https://maimaidx-eng.com/maimai-mobile/img/Music/${props.map.image})`,
                }}
            ></div>
            <div
                className="mapCover"
                style={{
                    backgroundImage: `url(https://maimaidx-eng.com/maimai-mobile/img/Music/${props.map.image})`,
                }}
            ></div>
            <div className="metadata">
                <div className="title">{props.map.title}</div>
                <div className="artist">{props.map.artist}</div>
                <div className={`type ${props.map.type === CHART_DIFF.RE_MASTER ? "REMAS" : props.map.type}`}>{props.map.type}</div>
            </div>
            <div
                className="version"
                style={{
                    backgroundImage: `url(/${props.map.version}.png)`,
                }}
            ></div>
            <div className="level">
                Lv<span>{props.map.lvl}</span>
            </div>
            <div className={`state ${props.map.state}`}></div>

            <style jsx>{`
                .mapNode {
                    position: relative;
                    width: 100%;
                    height: 84px;

                    border-radius: 10px;

                    background-color: rgba(0 0 0 /0.5);
                    overflow: hidden;

                    padding: 8px;

                    display: flex;
                    gap: 10px;
                }

                .background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;

                    background-size: cover;
                    background-position: center;
                    opacity: 0.7;
                }

                .mapCover {
                    position: relative;
                    aspect-ratio: 1 / 1;
                    height: 100%;
                    background-size: cover;
                    background-position: center;

                    border-radius: 10px;
                }

                .metadata {
                    position: relative;
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

                .REMAS {
                    
                }

                .level {
                    position: absolute;
                    bottom: 0;
                    right: 0;

                    padding: 5px 15px;
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

                    margin: 5px;

                    width: 35px;
                    height: 7px;

                    background-color: white;
                    border-radius: 6px;

                    background-size: contain;
                    background-position: center right;
                    background-repeat: no-repeat;
                }

                .state {
                    position: absolute;
                    top: 0;
                    left: 0;

                    width: 100%;
                    height: 100%;

                    border: solid 4px transparent;
                    transition: ease-in-out 200ms;
                }

                .state.BAN {
                    opacity: 1;
                    background-color: rgba(0 0 0 / 0.5);
                    border-color: #f23a65;
                }

                .state.PICK {
                    opacity: 1;
                    border-color: #3aa6f2;
                }

                .state.LOCK {
                    opacity: 1;
                    background-color: rgba(0 0 0 / 0.5);
                }
            `}</style>
        </div>
    );
};

export default MapNode;
