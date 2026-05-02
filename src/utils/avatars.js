const AVATAR_COLORS = [
  '#e63946', '#f4c542', '#2a9d8f', '#4895ef',
  '#c77dff', '#ff9f1c', '#2ec4b6', '#e94560',
];

export function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function avatarInitial(name) {
  return (name || '?').charAt(0).toUpperCase();
}
