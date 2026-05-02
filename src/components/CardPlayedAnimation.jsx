import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import UnoCard from "./UnoCard";
import "./CardPlayedAnimation.css";

export default function CardPlayedAnimation({ data }) {
  const { state, dispatch } = useGame();
  const { myId } = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "CLEAR_ANIMATION" });
    }, 1400);
    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!data) return null;

  const isMe = data.playerId === myId;
  const playerLabel = isMe ? "You" : data.playerName;

  return (
    <div className="card-played-overlay" key={data.card?.id || Date.now()}>
      <div className="card-played-inner">
        <span className="card-played-label">{playerLabel} played</span>
        <div className="card-played-card-wrapper">
          <UnoCard
            card={data.card}
            large
            overrideColor={data.chosenColor || null}
          />
        </div>
      </div>
    </div>
  );
}
