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
  drewCard: false,
  showYourTurn: false,
  prevTurnPlayer: null,
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

    case "GAME_STARTED": {
      const startPlayer = action.payload.gameState?.currentPlayer;
      const isMyStart = startPlayer === state.myId;
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
        drewCard: false,
        showYourTurn: isMyStart,
        prevTurnPlayer: startPlayer,
      };
    }

    case "GAME_STATE": {
      const newCurrent = action.payload.currentPlayer;
      const wasMyTurn = state.prevTurnPlayer === state.myId;
      const isNowMyTurn = newCurrent === state.myId;
      const turnChanged = newCurrent !== state.prevTurnPlayer;
      const justBecameMyTurn = isNowMyTurn && !wasMyTurn && turnChanged;
      return {
        ...state,
        gameState: action.payload,
        selectedCardId:
          newCurrent !== state.myId ? null : state.selectedCardId,
        prevTurnPlayer: newCurrent,
        showYourTurn: justBecameMyTurn ? true : state.showYourTurn,
      };
    }

    case "HAND_UPDATED":
      return {
        ...state,
        hand: action.payload.hand,
        selectedCardId: null,
      };

    case "DREW_CARD":
      return { ...state, drewCard: true };

    case "CLEAR_DREW_CARD":
      return { ...state, drewCard: false };

    case "SHOW_YOUR_TURN":
      return { ...state, showYourTurn: true };

    case "CLEAR_YOUR_TURN":
      return { ...state, showYourTurn: false };

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
      return state;

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
        lastPlayedCard: null,
        drewCard: false,
        showYourTurn: false,
        prevTurnPlayer: null,
        screen: "room",
        loading: null,
      };

    default:
      return state;
  }
}

const COLOR_LABELS = {
  red: "Red",
  green: "Green",
  blue: "Blue",
  yellow: "Yellow",
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addToast = useCallback((message, type = "info", duration = 2000) => {
    dispatch({ type: "ADD_TOAST", payload: { message, type, duration } });
  }, []);

  useEffect(() => {
    function onConnect() {
      dispatch({ type: "SET_CONNECTED", payload: true });
      const s = stateRef.current;
      if (s.loading) {
        dispatch({ type: "SET_LOADING", payload: null });
      }
      if (s.screen !== "home" && s.room) {
        const myPlayer = s.room.players?.find((p) => p.id === s.myId);
        const myName = myPlayer?.name || "Player";
        socket.emit("rejoin_room", {
          roomCode: s.room.roomCode,
          name: myName,
        });
        addToast("Reconnected!", "success", 1500);
      }
    }

    function onDisconnect() {
      dispatch({ type: "SET_CONNECTED", payload: false });
      if (stateRef.current.screen !== "home") {
        addToast("Connection lost. Reconnecting...", "error", 2500);
      }
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
        const count = data.drawnCount || 1;
        dispatch({ type: "DREW_CARD" });
        setTimeout(() => dispatch({ type: "CLEAR_DREW_CARD" }), 1200);
      }
    }

    function onCardEffect(data) {
      const colorLabel = COLOR_LABELS[data.color] || data.color;
      const labels = {
        skip: "Skipped!",
        reverse: "Reversed!",
        draw2: data.stackCount > 0 ? `+2 stacked! (${data.stackCount} total)` : "+2 cards!",
        wild: `Color changed to ${colorLabel}`,
        wild_draw4: data.stackCount > 0 ? `+4 stacked! (${data.stackCount} total)` : `+4 cards! Color: ${colorLabel}`,
      };
      if (data.effect && labels[data.effect]) {
        addToast(labels[data.effect], "info", 1800);
      }
    }

    function onCardPlayed(data) {
      dispatch({ type: "CARD_PLAYED", payload: data });
      setTimeout(() => dispatch({ type: "CLEAR_PLAYED_CARD" }), 1400);
    }

    function onPlayerFined(data) {
      dispatch({ type: "PLAYER_FINED", payload: data });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(
        isMe
          ? `Invalid play! +${data.fineCount} cards`
          : `${data.playerName} fined +${data.fineCount}!`,
        isMe ? "error" : "warning",
        2500,
      );
      setTimeout(() => dispatch({ type: "CLEAR_FINE" }), 2500);
    }

    function onStackResolved(data) {
      const isMe = data.playerId === stateRef.current.myId;
      addToast(
        isMe
          ? `You drew ${data.count} stacked cards!`
          : `${data.playerName} drew ${data.count} stacked cards!`,
        isMe ? "warning" : "info",
        2000,
      );
    }

    function onPlayerPassed(data) {
      const isMe = data.playerId === stateRef.current.myId;
      if (!isMe) {
        addToast(`${data.playerName} passed`, "info", 1500);
      }
    }

    function onUnoWindowOpen(data) {
      dispatch({ type: "UNO_WINDOW_OPEN", payload: data });
    }

    function onUnoSafe(data) {
      dispatch({ type: "UNO_WINDOW_CLOSE" });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(isMe ? "UNO called!" : "UNO called safely", "success", 1500);
    }

    function onUnoPenalty(data) {
      dispatch({ type: "UNO_WINDOW_CLOSE" });
      const isMe = data.playerId === stateRef.current.myId;
      addToast(
        isMe
          ? `Caught by ${data.caughtByName}! +2`
          : `${data.playerName} caught! +2`,
        isMe ? "error" : "success",
        2000,
      );
    }

    function onGameOver(data) {
      dispatch({ type: "GAME_OVER", payload: data });
    }

    function onPlayerLeft(data) {
      if (data.playerId !== stateRef.current.myId) {
        addToast(`${data.name} left`, "info", 1500);
      }
    }

    function onPlayerDrew(data) {
      if (data.playerId !== stateRef.current.myId) {
        addToast(`${data.playerName} drew a card`, "info", 1500);
      }
    }

    function onError(data) {
      dispatch({ type: "SET_LOADING", payload: null });
      addToast(data.message || "Something went wrong", "error", 2500);
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
    socket.on("stack_resolved", onStackResolved);
    socket.on("player_passed", onPlayerPassed);
    socket.on("uno_window_open", onUnoWindowOpen);
    socket.on("uno_safe", onUnoSafe);
    socket.on("uno_penalty", onUnoPenalty);
    socket.on("game_over", onGameOver);
    socket.on("player_left", onPlayerLeft);
    socket.on("player_drew", onPlayerDrew);
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
      socket.off("stack_resolved", onStackResolved);
      socket.off("player_passed", onPlayerPassed);
      socket.off("uno_window_open", onUnoWindowOpen);
      socket.off("uno_safe", onUnoSafe);
      socket.off("uno_penalty", onUnoPenalty);
      socket.off("game_over", onGameOver);
      socket.off("player_left", onPlayerLeft);
      socket.off("player_drew", onPlayerDrew);
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
