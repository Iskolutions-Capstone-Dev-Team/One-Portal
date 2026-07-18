import { describe, it, expect } from 'vitest';
import * as Icons from '../LandingIcons';

describe('LandingIcons Component', () => {
  it('exports icon components', () => {
    expect(Icons.StarBadgeIcon).toBeDefined();
    expect(Icons.LoginIcon).toBeDefined();
    expect(Icons.MenuIcon).toBeDefined();
    expect(Icons.GraduateIcon).toBeDefined();
    expect(Icons.CampusIcon).toBeDefined();
    expect(Icons.CalendarIcon).toBeDefined();
    expect(Icons.PeopleIcon).toBeDefined();
    expect(Icons.HomeBadgeIcon).toBeDefined();
    expect(Icons.RegisterIcon).toBeDefined();
  });
});
