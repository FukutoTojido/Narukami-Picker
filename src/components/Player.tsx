import { User } from "@/types/types";

const getColorFromRating = (rating: number): string => {
    if (rating >= 7000 && rating <= 9999) return "RED";
    if (rating >= 10000 && rating <= 11999) return "PURPLE";
    if (rating >= 12000 && rating <= 12999) return "BRONZE";
    if (rating >= 13000 && rating <= 13999) return "SILVER";
    if (rating >= 14000 && rating <= 14999) return "GOLD";
    return "RAINBOW";
};

const Player = (props: { data: User }) => {
    return (
        <div className={`playerNode`}>
            <div className={`ratingColor ${getColorFromRating(props.data.rating)}`}></div>
            <div
                className="icon"
                style={{
                    backgroundImage: `url(${props.data.avatar})`,
                }}
            ></div>
            <div className="stats">
                <div className="name">
                    {props.data.username.replace(/[\uff01-\uff5e]/g, function (ch) {
                        return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
                    })}
                </div>
                <div className="rating">rating: {props.data.rating}</div>
            </div>

            <style jsx>
                {`
                    .playerNode {
                        position: relative;

                        width: 100%;
                        height: 84px;

                        padding: 10px;

                        border-radius: 10px;
                        background-image: linear-gradient(0deg, #6d526a, #885560);

                        display: flex;
                        align-items: center;
                        gap: 20px;
                    }

                    .icon {
                        position: relative;

                        height: 100%;
                        aspect-ratio: 1 / 1;

                        background-color: rgba(0 0 0 /0.5);
                        border-radius: 10px;

                        background-size: cover;
                        background-position: center;
                    }

                    .stats {
                        position: relative;
                        top: 3px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        line-height: 25px;
                    }

                    .rating {
                        position: relative;
                        font-size: 14px;
                        font-style: italic;
                    }

                    .name {
                        position: relative;
                        font-size: 24px;
                        font-weight: 700;
                    }

                    .ratingColor {
                        position: absolute;
                        top: 0;
                        left: 0;

                        width: 100%;
                        height: 100%;

                        border-radius: 10px;

                        opacity: 30%;
                    }

                    .RED {
                        background-image: linear-gradient(-45deg, rgba(161, 49, 70, 1) 0%, rgba(205, 70, 106, 1) 100%);
                    }
                    .PURPLE {
                        background-image: linear-gradient(-45deg, rgba(113, 49, 161, 1) 0%, rgba(110, 70, 205, 1) 100%);
                    }
                    .BRONZE {
                        background-image: linear-gradient(-45deg, rgba(238, 191, 104, 1) 0%, rgba(205, 70, 70, 1) 100%);
                    }
                    .SILVER {
                        background-image: linear-gradient(-45deg, rgba(191, 241, 243, 1) 0%, rgba(52, 205, 230, 1) 100%);
                    }
                    .GOLD {
                        background-image: linear-gradient(-45deg, rgba(243, 205, 191, 1) 0%, rgba(238, 204, 8, 1) 100%);
                    }
                    .RAINBOW {
                        background-image: linear-gradient(
                            -45deg,
                            rgba(243, 197, 191, 1) 0%,
                            rgba(242, 236, 167, 1) 19%,
                            rgba(195, 241, 132, 1) 40%,
                            rgba(85, 240, 228, 1) 61%,
                            rgba(43, 113, 239, 1) 81%,
                            rgba(207, 106, 232, 1) 100%
                        );
                    }
                `}
            </style>
        </div>
    );
};

export default Player;
