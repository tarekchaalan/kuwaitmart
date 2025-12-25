import { describe, it, expect, vi, beforeEach } from 'vitest';

const makeSB = () => ({
  auth: {
    signUp: vi.fn(async () => ({ data: { user: { id: 'u1' }, session: { access_token: 't' } }, error: null })),
    signInWithPassword: vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
    getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } } })),
    onAuthStateChange: vi.fn((cb) => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => ({
    upsert: vi.fn(async () => ({ error: null })),
    select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'u1', full_name: 'X' }, error: null })) })) })),
    update: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'u1', full_name: 'Y' }, error: null })) })) })) })),
  })),
});

describe('auth lib', () => {
  beforeEach(() => vi.clearAllMocks());

  it('signUp upserts profile when session exists, else stores patch', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({ getSupabase: () => makeSB() }));
    const { signUp } = await import('../../src/lib/auth.js');
    const user = await signUp({ email: 'a@b.c', password: 'x', fullName: 'Name', phone: '1', addressParts: { area: 'A' } });
    expect(user.id).toBe('u1');

    // Now simulate no session case
    vi.resetModules();
    const sb2 = makeSB(); sb2.auth.signUp = vi.fn(async () => ({ data: { user: { id: 'u2' }, session: null }, error: null }));
    vi.doMock('../../src/lib/supabaseClient.js', () => ({ getSupabase: () => sb2 }));
    const { signUp: signUp2 } = await import('../../src/lib/auth.js');
    await signUp2({ email: 'a', password: 'b', fullName: 'N' });
    expect(localStorage.getItem('birdsite.pendingProfilePatch')).toBeTruthy();
  });

  it('signIn, signOut, getProfile, updateProfile, getCurrentUser, onAuthStateChange work', async () => {
    const sb = makeSB();
    vi.doMock('../../src/lib/supabaseClient.js', () => ({ getSupabase: () => sb }));
    const { signIn, signOut, getProfile, updateProfile, getCurrentUser, onAuthStateChange } = await import('../../src/lib/auth.js');
    expect((await signIn({ email: 'e', password: 'p' })).id).toBe('u1');
    await expect(signOut()).resolves.toBeUndefined();
    const prof = await getProfile();
    expect(prof.user.id).toBe('u1');
    const updated = await updateProfile({ full_name: 'Y' });
    expect(updated.full_name).toBe('Y');
    const u = await getCurrentUser();
    expect(u.id).toBe('u1');
    const sub = onAuthStateChange(() => {});
    expect(sub).toBeTruthy();
  });
});


