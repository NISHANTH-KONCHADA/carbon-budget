/**
 * streak.js
 * ---------------------------------------------------------------------------
 * Pure logic for updating a user's daily logging streak. Kept separate
 * from the route/model layer so the date-math edge cases (same day,
 * consecutive day, gap, first-ever log) can be unit tested directly.
 * ---------------------------------------------------------------------------
 */

function toDateOnly(d) {
  const date = new Date(d);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffInDays(a, b) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((toDateOnly(a) - toDateOnly(b)) / MS_PER_DAY);
}

/**
 * @param {{ count: number, lastLogDate: Date|null }} currentStreak
 * @param {Date} activityDate - the date of the activity just logged
 * @returns {{ count: number, lastLogDate: Date }}
 */
function updateStreak(currentStreak, activityDate = new Date()) {
  const { count = 0, lastLogDate = null } = currentStreak || {};

  if (!lastLogDate) {
    return { count: 1, lastLogDate: toDateOnly(activityDate) };
  }

  const gap = diffInDays(activityDate, lastLogDate);

  if (gap === 0) {
    // Already logged something today/that day — streak unchanged.
    return { count: Math.max(count, 1), lastLogDate: toDateOnly(lastLogDate) };
  }
  if (gap === 1) {
    return { count: count + 1, lastLogDate: toDateOnly(activityDate) };
  }
  if (gap > 1) {
    // Missed at least one day — streak resets.
    return { count: 1, lastLogDate: toDateOnly(activityDate) };
  }
  // Activity backdated before the last log — don't disturb the streak.
  return { count, lastLogDate: toDateOnly(lastLogDate) };
}

module.exports = { updateStreak };
