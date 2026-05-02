import { useGame } from "../context/GameContext";
import { currentColorCSS } from "../utils/cardHelpers";
import socket from "../socket";
import OpponentStrip from "../components/OpponentStrip";
import UnoCard, { DrawPileCard } from "../components/UnoCard";
import Hand from "../components/Hand";
import { ColorPicker } from "../components/ColorPicker";
import { GameOverOverlay } from "../components/GameOverOverlay";
import CardPlayedAnimation from "../components/CardPlayedAnimation";
import Loader from "../components/Loader";
import "./GameScreen.css";

function YourTurnIndicator() {
  const { state, dispatch } = useGame();
  if (!state.showYourTurn) return null;

  return (
    <div
      className="your-turn-overlay"
      key={Date.now()}
      onAnimationEnd={() => dispatch({ type: "CLEAR_YOUR_TURN" })}
    >
      <div className="your-turn-content">
        <div className="your-turn-line" />
        <span className="your-turn-text">YOUR TURN</span>
        <div className="your-turn-line" />
      </div>
    </div>
  );
}

function DrewCardIndicator() {
  const { state, dispatch } = useGame();
  if (!state.drewCard) return null;

  return (
    <div
      className="drew-card-flash"
      key={Date.now()}
      onAnimationEnd={() => dispatch({ type: "CLEAR_DREW_CARD" })}
    >
      <div className="drew-card-icon">+1</div>
      <span className="drew-card-text">Card drawn</span>
    </div>
  );
}

export default function GameScreen() {
  const { state } = useGame();
  const { gameState, myId } = state;

  if (!gameState) return <Loader fullscreen text="Loading game..." />;

  const isMyTurn = gameState.currentPlayer === myId;
  const hasDrawn = gameState.hasDrawn || false;
  const drawStack = gameState.drawStack || 0;

  const handleDraw = () => {
    if (!isMyTurn || hasDrawn) return;
    socket.emit("draw_card");
  };

  const topCard = gameState.topCard;
  const overrideColor = !topCard.color ? gameState.currentColor : null;
  const currentColor = gameState.currentColor;

  return (
    <section className={`game-screen ${isMyTurn ? "my-turn" : ""}`}>
      <div className="game-turn-banner">
        <div className="turn-left">
          <div
            className="turn-color-dot"
            style={{ background: currentColorCSS(currentColor) }}
          />
          <span className="current-color-label">{currentColor}</span>
        </div>

        <div className="turn-center">
          <span className={`turn-text ${isMyTurn ? "highlight" : ""}`}>
            {isMyTurn ? "Your Turn!" : `${gameState.currentPlayerName}'s turn`}
          </span>
          {drawStack > 0 && (
            <span className="stack-badge">+{drawStack} stacked</span>
          )}
        </div>

        <div className="turn-right">
          <span
            className="turn-direction"
            title={
              gameState.direction === 1 ? "Clockwise" : "Counter-clockwise"
            }
          >
            {gameState.direction === 1 ? "↻" : "↺"}
          </span>
        </div>
      </div>

      <OpponentStrip />

      <div className="game-table">
        <div className="pile draw-pile-area">
          <DrawPileCard
            count={gameState.drawPileCount}
            onClick={handleDraw}
            disabled={!isMyTurn || hasDrawn}
          />
          <div className="pile-info">
            <span className="pile-label">Draw</span>
            <span className="pile-count">{gameState.drawPileCount}</span>
          </div>
        </div>

        <div className="table-direction">
          <div
            className={`direction-arrow ${gameState.direction === 1 ? "cw" : "ccw"}`}
          >
            {gameState.direction === 1 ? "→" : "←"}
          </div>
        </div>

        <div className="pile discard-pile-area">
          <div
            className="discard-glow"
            style={{ background: currentColorCSS(currentColor) }}
          />
          <UnoCard card={topCard} large overrideColor={overrideColor} discard />
          <div className="pile-info">
            <span className="pile-label">Discard</span>
          </div>
        </div>
      </div>

      <Hand />
      <YourTurnIndicator />
      <DrewCardIndicator />
      <CardPlayedAnimation />
      <ColorPicker />
      <GameOverOverlay />
    </section>
  );
}
