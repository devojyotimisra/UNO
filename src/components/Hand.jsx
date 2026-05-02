import { useGame } from "../context/GameContext";
import UnoCard from "./UnoCard";
import { cardDisplayName } from "../utils/cardHelpers";
import socket from "../socket";
import "./Hand.css";

export default function Hand() {
  const { state, dispatch } = useGame();
  const { hand, selectedCardId, gameState, myId } = state;
  const isMyTurn = gameState?.currentPlayer === myId;

  const handleCardClick = (card) => {
    if (!isMyTurn) return;
    if (selectedCardId === card.id) {
      dispatch({ type: "SELECT_CARD", payload: null });
    } else {
      dispatch({ type: "SELECT_CARD", payload: card.id });
    }
  };

  const selectedCard = hand.find((c) => c.id === selectedCardId);

  const handlePlay = () => {
    if (!selectedCard || !isMyTurn) return;
    if (selectedCard.type === "wild" || selectedCard.type === "wild_draw4") {
      dispatch({ type: "SHOW_COLOR_PICKER", payload: selectedCard.id });
    } else {
      socket.emit("play_card", { cardId: selectedCard.id });
      dispatch({ type: "SELECT_CARD", payload: null });
    }
  };

  const totalCards = hand.length;
  const maxSpread = Math.min(totalCards * 3, 40);
  const startAngle = -maxSpread / 2;

  return (
    <div className="hand-area">
      <div className="hand-label">
        <span className="hand-count">{hand.length}</span>
        <span>card{hand.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="hand-scroll">
        <div className="hand-fan">
          {hand.map((card, i) => {
            const angle =
              totalCards <= 1
                ? 0
                : startAngle + (i / (totalCards - 1)) * maxSpread;
            const translateY = Math.abs(angle) * 0.8;

            return (
              <div
                className={`hand-card-wrapper ${selectedCardId === card.id ? "selected-wrapper" : ""}`}
                key={card.id}
                style={{
                  "--card-angle": `${angle}deg`,
                  "--card-lift": `-${translateY}px`,
                  "--card-index": i,
                }}
              >
                <UnoCard
                  card={card}
                  valid={true}
                  selected={selectedCardId === card.id}
                  dealDelay={i * 50}
                  onClick={() => handleCardClick(card)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="hand-action-bar">
        <button
          className="btn btn-secondary"
          onClick={() => socket.emit("call_uno")}
        >
          🃏 UNO!
        </button>
        <button
          className="btn play-btn btn-primary"
          disabled={!isMyTurn || !selectedCard}
          onClick={handlePlay}
        >
          {!selectedCard
            ? "Select a card"
            : `▶ Play ${cardDisplayName(selectedCard)}`}
        </button>
      </div>
    </div>
  );
}
