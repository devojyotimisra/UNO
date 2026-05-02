import { useGame } from "../context/GameContext";
import UnoCard from "./UnoCard";
import "./CardPlayedAnimation.css";

export default function CardPlayedAnimation() {
  const { state } = useGame();
  const { lastPlayedCard, myId } = state;

  if (!lastPlayedCard) return null;

  const isMe = lastPlayedCard.playerId === myId;
  const playerLabel = isMe ? "You" : lastPlayedCard.playerName;

  return (
    <div className="card-played-overlay" key={lastPlayedCard.card?.id || Date.now()}>
      <div className="card-played-inner">
        <span className="card-played-label">{playerLabel} played</span>
        <div className="card-played-card-wrapper">
          <UnoCard
            card={lastPlayedCard.card}
            large
            overrideColor={lastPlayedCard.chosenColor || null}
          />
        </div>
      </div>
    </div>
  );
}
