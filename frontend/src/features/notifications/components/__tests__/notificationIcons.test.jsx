import { describe, it, expect } from 'vitest';
import { BellIcon } from '../notificationIcons';

describe('notificationIcons Component', () => {
  it('exports icon components', () => {
    expect(BellIcon).toBeDefined();
  });
});
