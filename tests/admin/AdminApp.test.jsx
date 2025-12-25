import { render, screen } from '@testing-library/react';
import React from 'react';
import AdminApp from '../../src/admin/AdminApp.jsx';
import { vi, describe, it, expect } from 'vitest';

// Mock shared supabase client used in AdminApp (define functions inside factory to avoid hoist issues)
vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/supabaseClient.js', () => {
  const onAuthStateChange = () => ({ data: { subscription: { unsubscribe: vi.fn() } } });
  const getSession = vi.fn(async () => ({ data: { session: null } }));
  const signOut = vi.fn(async () => {});
  const from = vi.fn(() => ({ select: vi.fn(() => ({ count: 0 })) }));
  return {
    supabase: {
      auth: { getSession, onAuthStateChange, signOut },
      from,
      rpc: vi.fn(async () => ({ data: false })),
      storage: { from: vi.fn(() => ({ upload: vi.fn(), getPublicUrl: vi.fn(() => ({ publicUrl: '' })) })) },
    },
  };
});

describe('AdminApp', () => {
  it('renders login when no session', async () => {
    render(<AdminApp />);
    expect(await screen.findByText(/Admin Login/i)).toBeInTheDocument();
  });
});


