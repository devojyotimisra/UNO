import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from "react";
import socket from "../socket";

const GameContext = createContext(null);

const initialState = {
  screen: "home",
  myId: null,
  room: null,
  gameState: null,
  hand: [],
  selectedCardId: null,
  showColorPicker: false,
  pendingWildCardId: null,
  unoWindow: null,
  gameOver: null,
  connected: false,
  loading: null,
  toasts: [],
  lastFine: null,
  lastPlayedCard: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, connected: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "ROOM_CREATED":
    case "ROOM_JOINED":
      return {
        ...state,
        myId: action.payload.playerId,
        room: action.payload.room,
        screen: "room",
        loading: null,
      };

    case "ROOM_UPDATED":
      return { ...state, room: action.payload.room };

    case "GAME_STARTED":
      return {
        ...state,
        hand: action.payload.hand,
        gameState: action.payload.gameState,
        screen: "game",
        loading: null,
        selectedCardId: null,
        showColorPicker: false,
        pendingWildCardId: null,
        unoWindow: null,
        gameOver: null,
        lastFine: null,
        lastPlayedCard: null,
      };

    case "GAME_STATE":
      return {
        ...state,
        gameState: action.payload,
        selectedCardId:
          action.payload.currentPlayer !== state.myId
            ? null
            : state.selectedCardId,
      };

    case "HAND_UPDATED":
      return {
        ...state,
        hand: action.payload.hand,
        selectedCardId: null,
      };

    case "SELECT_CARD":
      return { ...state, selectedCardId: action.payload };

    case "SHOW_COLOR_PICKER":
      return {
        ...state,
        showColorPicker: true,
        pendingWildCardId: action.payload,
      };

    case "HIDE_COLOR_PICKER":
      return { ...state, showColorPicker: false, pendingWildCardId: null };

    case "UNO_WINDOW_OPEN":
      return { ...state, unoWindow: action.payload };

    case "UNO_WINDOW_CLOSE":
      return { ...state, unoWindow: null };

    case "GAME_OVER":
      return { ...state, gameOver: action.payload };

    case "PLAYER_FINED":
      return { ...state, lastFine: action.payload };

    case "CARD_PLAYED":
      return { ...state, lastPlayedCard: action.payload };

    case "CLEAR_PLAYED_CARD":
      return { ...state, lastPlayedCard: null };

    case "CLEAR_FINE":
      return { ...state, lastFine: null };

    case "PLAYER_LEFT":
      return state; // handled by toasts

    case "ADD_TOAST": {
      const toast = { id: Date.now() + Math.random(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case "RESET_TO_HOME":
      return {
        ...initialState,
        connected: state.connected,
        toasts: state.toasts,
      };

    case "RESET_TO_ROOM":
      return {
        ...state,
        gameState: null,
        hand: [],
        selectedCardId: null,
        showColorPicker: false,
        pendingWildCardId: null,
        unoWindow: null,
        gameOver: null,
        lastFine: null,
        screen: "room",
        loading: null,
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type, duration } });
  }, []);

  useEffect(() => {
    function onConnect() {
      dispatch({ type: "SET_CONNECTED", payload: true });
      const s = stateRef.current;
      if (s.screen !== "home" && s.room) {
        // Attempt to rejoin after a reconnect (mobile background, etc.)
        const myPlayer = s.room.players?.find((p) => p.id === s.myId);
        const myName = myPlayer?.name || "Player";
        socket.emit("rejoin_room", {
          roomCode: s.room.roomCode,
          name: myName,
        });
        addToast("Reconnected!", "success", 2000);
      }
    }

    function onDisconnect() {
      dispatch({ type: "SET_CONNECTED", payload: false });
      addToast("Connection lost. Reconnecting…", "error", 5000);
    }

    function onRoomCreated(data) {
      dispatch({ type: "ROOM_CREATED", payload: data });
    }

    function onRoomJoined(data) {
      dispatch({ type: "ROOM_JOINED", payload: data });
    }

    function onRoomUpdated(data) {
      dispatch({ type: "ROOM_UPDATED", payload: data });
    }

    function onGameStarted(data) {
      dispatch({ type: "GAME_STARTED", payload: data });
    }

    function onGameState(data) {
      dispatch({ type: "GAME_STATE", payload: data });
    }

    function onHandUpdated(data) {
      dispatch({ type: "HAND_UPDATED", payload: data });
      if (data.drawnCard) {
        addToast("You drew a card", "info", 1800);
      }
    }

    function onCardEffect(data) {
      const labels = {
        skip: "Skipped!",
        reverse: "Direction reversed!",
        draw2: "+2 cards!",
        wild: "Color changed!",
        wild_draw4: "+4 cards!",
      };
      if (data.effect && labels[data.effect]) {
        addToast(labels[data.effect], "info", 2500);
      }
    }

    function onCardPlayed(data) {
      dispatch({ type: "CARD_PLAYED", payload: data });
      // Auto-clear after animation duration
      setTimeout(() => dispatch({ type: "CLEAR_PLAYED_CARD" }), 1600);
    }

    function onPlayerFined(data) {
      dispatch({ type: "PLAYER_FINED", payload: data });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(
        isMe
          ? `Invalid play! You were fined +${data.fineCount} cards`
          : `${data.playerName} was fined +${data.fineCount} cards!`,
        isMe ? "error" : "warning",
        3500,
      );
      // Clear fine indicator after animation
      setTimeout(() => dispatch({ type: "CLEAR_FINE" }), 3000);
    }

    function onUnoWindowOpen(data) {
      dispatch({ type: "UNO_WINDOW_OPEN", payload: data });
    }

    function onUnoSafe(data) {
      dispatch({ type: "UNO_WINDOW_CLOSE" });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(isMe ? "UNO called!" : "UNO was called safely", "success", 2000);
    }

    function onUnoPenalty(data) {
      dispatch({ type: "UNO_WINDOW_CLOSE" });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(
        isMe
          ? `Caught by ${data.caughtByName}! +2 cards`
          : `${data.playerName} caught! +2 penalty`,
        isMe ? "error" : "success",
        3000,
      );
    }

    function onGameOver(data) {
      dispatch({ type: "GAME_OVER", payload: data });
    }

    function onPlayerLeft(data) {
      addToast(`${data.name} left the game`, "info", 3000);
    }

    function onError(data) {
      dispatch({ type: "SET_LOADING", payload: null });
      addToast(data.message || "Something went wrong", "error", 3500);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("room_joined", onRoomJoined);
    socket.on("room_updated", onRoomUpdated);
    socket.on("game_started", onGameStarted);
    socket.on("game_state", onGameState);
    socket.on("hand_updated", onHandUpdated);
    socket.on("card_effect", onCardEffect);
    socket.on("card_played", onCardPlayed);
    socket.on("player_fined", onPlayerFined);
    socket.on("uno_window_open", onUnoWindowOpen);
    socket.on("uno_safe", onUnoSafe);
    socket.on("uno_penalty", onUnoPenalty);
    socket.on("game_over", onGameOver);
    socket.on("player_left", onPlayerLeft);
    socket.on("error", onError);

    if (socket.connected) {
      dispatch({ type: "SET_CONNECTED", payload: true });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created", onRoomCreated);
      socket.off("room_joined", onRoomJoined);
      socket.off("room_updated", onRoomUpdated);
      socket.off("game_started", onGameStarted);
      socket.off("game_state", onGameState);
      socket.off("hand_updated", onHandUpdated);
      socket.off("card_effect", onCardEffect);
      socket.off("card_played", onCardPlayed);
      socket.off("player_fined", onPlayerFined);
      socket.off("uno_window_open", onUnoWindowOpen);
      socket.off("uno_safe", onUnoSafe);
      socket.off("uno_penalty", onUnoPenalty);
      socket.off("game_over", onGameOver);
      socket.off("player_left", onPlayerLeft);
      socket.off("error", onError);
    };
  }, [addToast]);

  const value = { state, dispatch, addToast };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
