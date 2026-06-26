interface MentorAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
}

export default function MentorAvatar({
  name,
  avatarUrl,
  size = 'md',
}: MentorAvatarProps) {
  const sizeClass = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-border shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-rs-accent to-rs-accent-hover flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
