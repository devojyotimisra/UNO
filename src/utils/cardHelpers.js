const ACTION_LABELS = {
  skip: '⊘',
  reverse: '⟳',
  draw2: '+2',
  wild: '✦',
  wild_draw4: '+4',
};

export function cardLabel(card) {
  if (!card) return '';
  if (card.type === 'number') return String(card.value);
  return ACTION_LABELS[card.type] || '?';
}

export function cardDisplayName(card) {
  if (!card) return '';
  const colorName = card.color ? card.color.charAt(0).toUpperCase() + card.color.slice(1) : 'Wild';
  if (card.type === 'number') return `${colorName} ${card.value}`;
  if (card.type === 'skip') return `${colorName} Skip`;
  if (card.type === 'reverse') return `${colorName} Reverse`;
  if (card.type === 'draw2') return `${colorName} +2`;
  if (card.type === 'wild') return 'Wild';
  if (card.type === 'wild_draw4') return 'Wild +4';
  return 'Card';
}

export function cardColorCSS(card) {
  if (!card || !card.color) return 'var(--card-wild)';
  const map = {
    red: 'var(--card-red)',
    green: 'var(--card-green)',
    blue: 'var(--card-blue)',
    yellow: 'var(--card-yellow)',
  };
  return map[card.color] || 'var(--card-wild)';
}

export function currentColorCSS(color) {
  const map = {
    red: 'var(--card-red)',
    green: 'var(--card-green)',
    blue: 'var(--card-blue)',
    yellow: 'var(--card-yellow)',
  };
  return map[color] || '#888';
}

export function isValidPlay(card, gameState) {
  if (!card || !gameState) return false;
  if (card.type === 'wild' || card.type === 'wild_draw4') return true;
  const top = gameState.topCard;
  return (
    card.color === gameState.currentColor ||
    card.type === top.type ||
    (card.type === 'number' && card.value === top.value)
  );
}

const COLOR_ORDER = { red: 0, yellow: 1, green: 2, blue: 3 };
const TYPE_ORDER = { number: 0, skip: 1, reverse: 2, draw2: 3, wild: 4, wild_draw4: 5 };

export function sortHand(hand) {
  return [...hand].sort((a, b) => {
    const aIsWild = !a.color;
    const bIsWild = !b.color;
    if (aIsWild && !bIsWild) return 1;
    if (!aIsWild && bIsWild) return -1;

    const aColor = COLOR_ORDER[a.color] ?? 99;
    const bColor = COLOR_ORDER[b.color] ?? 99;
    if (aColor !== bColor) return aColor - bColor;

    const aType = TYPE_ORDER[a.type] ?? 99;
    const bType = TYPE_ORDER[b.type] ?? 99;
    if (aType !== bType) return aType - bType;

    return (a.value ?? 0) - (b.value ?? 0);
  });
}
