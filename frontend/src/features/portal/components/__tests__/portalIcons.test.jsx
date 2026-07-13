import { describe, it, expect } from 'vitest';
import * as Icons from '../portalIcons';

describe('portalIcons Component', () => {
  it('exports icon components', () => {
    expect(Icons.FacebookIcon).toBeDefined();
    expect(Icons.EmailIcon).toBeDefined();
    expect(Icons.BrowseIcon).toBeDefined();
    expect(Icons.InfoIcon).toBeDefined();
    expect(Icons.SearchIcon).toBeDefined();
    expect(Icons.ArrowIcon).toBeDefined();
  });
});
