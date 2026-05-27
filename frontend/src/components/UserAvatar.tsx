// deterministic initials avatar — usernames in the seed are like "dana_white",
// so we split on common separators and take two initials. the hue is hashed
// from the same string so a given user always gets the same color across pages.

type Props = {
  username?: string | null;
  userId: number;
  size?: number;
};

function hashHue(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function initials(name: string): string {
  const parts = name.split(/[_\s.-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function UserAvatar({ username, userId, size = 36 }: Props) {
  const seed = username ?? `user-${userId}`;
  const hue = hashHue(seed);

  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full border border-white/10 font-medium text-white/95"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `radial-gradient(120% 120% at 30% 15%, hsl(${hue} 38% 34%), hsl(${(hue + 30) % 360} 42% 18%))`,
      }}
      aria-hidden="true"
    >
      {initials(seed)}
    </div>
  );
}
