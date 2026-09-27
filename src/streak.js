// Streaks count consecutive calendar days (in the user's local time) with at
// least one successful grass touch.

// Local date as YYYY-MM-DD.
export const dayKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const daysBetween = (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000);

// The streak as of `today`: it resets to 0 once a full day has been missed.
export function currentStreak({ streak, lastSuccessDate }, today = dayKey()) {
  if (!lastSuccessDate) return 0;
  return daysBetween(lastSuccessDate, today) <= 1 ? streak : 0;
}

// Streak fields after an attempt. Only the first success of a day extends it,
// and a failed photo never breaks it.
export function nextStreak({ streak, lastSuccessDate }, success, today = dayKey()) {
  if (!success || lastSuccessDate === today) {
    return { streak, lastSuccessDate };
  }
  const continues = lastSuccessDate && daysBetween(lastSuccessDate, today) === 1;
  return { streak: continues ? streak + 1 : 1, lastSuccessDate: today };
}
