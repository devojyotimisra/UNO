import { GameProvider, useGame } from "./context/GameContext";
import HomeScreen from "./screens/HomeScreen";
import RoomScreen from "./screens/RoomScreen";
import GameScreen from "./screens/GameScreen";
import ToastContainer from "./components/Toast";
import "./App.css";

function ScreenRouter() {
  const { state } = useGame();

  return (
    <div className="screen-enter" key={state.screen}>
      {state.screen === "home" && <HomeScreen />}
      {state.screen === "room" && <RoomScreen />}
      {state.screen === "game" && <GameScreen />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <ScreenRouter />
      <ToastContainer />
    </GameProvider>
  );
}
