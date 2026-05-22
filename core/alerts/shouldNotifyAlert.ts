type ShouldNotifyInput = {
  lastNotifiedAt?: Date | null;
  cooldownMinutes: number;
};

export function shouldNotifyAlert({
  lastNotifiedAt,
  cooldownMinutes,
}: ShouldNotifyInput): boolean {
  if (!lastNotifiedAt) return true;

  const now = Date.now();
  const last = new Date(lastNotifiedAt).getTime();

  const diffMinutes = (now - last) / 1000 / 60;

  return diffMinutes >= cooldownMinutes;
}
