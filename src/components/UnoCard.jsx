import "./UnoCard.css";

function SkipIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
      <line
        x1="10"
        y1="38"
        x2="38"
        y2="10"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReverseIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8 L14 32 L6 24"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M34 40 L34 16 L42 24"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Draw2Icon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="6"
        y="10"
        width="20"
        height="30"
        rx="3"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <rect
        x="22"
        y="8"
        width="20"
        height="30"
        rx="3"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <text
        x="16"
        y="30"
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        +2
      </text>
    </svg>
  );
}

function WildDraw4Icon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="12"
        width="16"
        height="24"
        rx="3"
        fill="var(--card-red)"
        opacity="0.9"
      />
      <rect
        x="12"
        y="10"
        width="16"
        height="24"
        rx="3"
        fill="var(--card-blue)"
        opacity="0.9"
      />
      <rect
        x="20"
        y="8"
        width="16"
        height="24"
        rx="3"
        fill="var(--card-green)"
        opacity="0.9"
      />
      <rect
        x="28"
        y="6"
        width="16"
        height="24"
        rx="3"
        fill="var(--card-yellow)"
        opacity="0.9"
      />
      <text
        x="36"
        y="22"
        textAnchor="middle"
        fill="#1a1a2e"
        fontSize="10"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        +4
      </text>
    </svg>
  );
}

function CardCenter({ card, large }) {
  const sz = large ? 32 : 22;

  if (card.type === "skip") {
    return <SkipIcon size={sz} color="currentColor" />;
  }
  if (card.type === "reverse") {
    return <ReverseIcon size={sz} color="currentColor" />;
  }
  if (card.type === "draw2") {
    return <span className="card-center-text">+2</span>;
  }
  if (card.type === "wild") {
    return (
      <div className="wild-diamond">
        <div className="wd-quarter wd-red" />
        <div className="wd-quarter wd-blue" />
        <div className="wd-quarter wd-green" />
        <div className="wd-quarter wd-yellow" />
      </div>
    );
  }
  if (card.type === "wild_draw4") {
    return <WildDraw4Icon size={sz} />;
  }
  return <span className="card-center-text">{card.value}</span>;
}

function CornerLabel({ card }) {
  if (card.type === "number") return String(card.value);
  if (card.type === "skip") return "⊘";
  if (card.type === "reverse") return "⟳";
  if (card.type === "draw2") return "+2";
  if (card.type === "wild") return "✦";
  if (card.type === "wild_draw4") return "+4";
  return "?";
}

export default function UnoCard({
  card,
  valid = true,
  selected = false,
  large = false,
  dealDelay = 0,
  discard = false,
  faceDown = false,
  onClick,
  overrideColor,
  className: extraClass = "",
}) {
  if (faceDown) {
    return <CardBack large={large} />;
  }

  const color = overrideColor || card.color;
  const colorClass = color ? `color-${color}` : "color-wild";
  const corner = <CornerLabel card={card} />;

  const classes = [
    "uno-card",
    colorClass,
    valid && "valid-play",
    !valid && "invalid-play",
    selected && "selected",
    large && "large",
    dealDelay > 0 && "dealing",
    discard && "discard-enter",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");

  const style =
    dealDelay > 0 ? { animationDelay: `${dealDelay}ms` } : undefined;

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${color || "wild"} ${card.type} ${card.value ?? ""}`}
    >
      <div className="card-oval" />

      <span className="card-corner tl">{corner}</span>
      <span className="card-corner br">{corner}</span>

      <div className="card-center">
        <CardCenter card={card} large={large} />
      </div>
    </div>
  );
}

function CardBack({ large }) {
  return (
    <div className={`uno-card-back ${large ? "large" : ""}`}>
      <div className="card-back-oval">
        <span className="card-back-logo">UNO</span>
      </div>
    </div>
  );
}

export function DrawPileCard({ count, onClick, disabled }) {
  return (
    <div className="draw-pile-wrapper">
      <div className="draw-pile-stack stack-3" />
      <div className="draw-pile-stack stack-2" />
      <div className="draw-pile-stack stack-1" />
      <div
        className={`uno-card-back draw-pile-top ${disabled ? "disabled" : ""}`}
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={0}
        aria-label={`Draw pile, ${count} cards remaining`}
      >
        <div className="card-back-oval">
          <span className="card-back-logo">UNO</span>
        </div>
      </div>
    </div>
  );
}
