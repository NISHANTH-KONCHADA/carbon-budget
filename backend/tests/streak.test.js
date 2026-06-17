const { updateStreak } = require('../utils/streak');

describe('updateStreak', () => {
  test('starts a new streak at 1 on the first ever log', () => {
    const result = updateStreak({ count: 0, lastLogDate: null }, new Date('2026-06-10'));
    expect(result.count).toBe(1);
  });

  test('does not increment when logging again the same day', () => {
    const result = updateStreak(
      { count: 3, lastLogDate: new Date('2026-06-10T08:00:00') },
      new Date('2026-06-10T20:00:00')
    );
    expect(result.count).toBe(3);
  });

  test('increments by 1 on the very next day', () => {
    const result = updateStreak(
      { count: 3, lastLogDate: new Date('2026-06-10') },
      new Date('2026-06-11')
    );
    expect(result.count).toBe(4);
  });

  test('resets to 1 after a missed day', () => {
    const result = updateStreak(
      { count: 5, lastLogDate: new Date('2026-06-10') },
      new Date('2026-06-13')
    );
    expect(result.count).toBe(1);
  });

  test('leaves streak unchanged for a backdated entry before the last log', () => {
    const result = updateStreak(
      { count: 5, lastLogDate: new Date('2026-06-10') },
      new Date('2026-06-05')
    );
    expect(result.count).toBe(5);
    expect(result.lastLogDate.toISOString().slice(0, 10)).toBe('2026-06-10');
  });
});
