import { currentStreak, nextStreak } from './streak';

describe('nextStreak', () => {
  test('first success starts a streak of 1', () => {
    expect(nextStreak({ streak: 0, lastSuccessDate: undefined }, true, '2026-09-27'))
      .toEqual({ streak: 1, lastSuccessDate: '2026-09-27' });
  });

  test('success on the next day extends the streak', () => {
    expect(nextStreak({ streak: 3, lastSuccessDate: '2026-09-26' }, true, '2026-09-27'))
      .toEqual({ streak: 4, lastSuccessDate: '2026-09-27' });
  });

  test('extra successes on the same day do not inflate the streak', () => {
    expect(nextStreak({ streak: 4, lastSuccessDate: '2026-09-27' }, true, '2026-09-27'))
      .toEqual({ streak: 4, lastSuccessDate: '2026-09-27' });
  });

  test('success after a missed day restarts at 1', () => {
    expect(nextStreak({ streak: 5, lastSuccessDate: '2026-09-24' }, true, '2026-09-27'))
      .toEqual({ streak: 1, lastSuccessDate: '2026-09-27' });
  });

  test('a failed photo leaves the streak alone', () => {
    expect(nextStreak({ streak: 2, lastSuccessDate: '2026-09-26' }, false, '2026-09-27'))
      .toEqual({ streak: 2, lastSuccessDate: '2026-09-26' });
  });

  test('works across month boundaries', () => {
    expect(nextStreak({ streak: 1, lastSuccessDate: '2026-09-30' }, true, '2026-10-01').streak).toBe(2);
  });
});

describe('currentStreak', () => {
  test('is kept through the day after the last success', () => {
    expect(currentStreak({ streak: 3, lastSuccessDate: '2026-09-26' }, '2026-09-27')).toBe(3);
  });

  test('resets once a full day is missed', () => {
    expect(currentStreak({ streak: 3, lastSuccessDate: '2026-09-25' }, '2026-09-27')).toBe(0);
  });

  test('is 0 with no successes yet', () => {
    expect(currentStreak({ streak: 0 }, '2026-09-27')).toBe(0);
  });
});
