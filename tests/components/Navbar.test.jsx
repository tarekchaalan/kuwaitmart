import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../src/lib/auth.js', () => ({
  signIn: vi.fn(async () => ({})),
  signUp: vi.fn(async () => ({})),
  signOut: vi.fn(async () => ({})),
}));

vi.mock('../../src/lib/cart.js', () => ({
  mergeGuestIntoUserCart: vi.fn(async () => ({})),
}));

describe('Navbar', () => {
  it('toggles auth modal and performs login', async () => {
    const { default: Navbar } = await import('../../src/components/Navbar.jsx');
    const store = {
      lang: 'en', setLang: vi.fn(), query: '', setQuery: vi.fn(), setCartOpen: vi.fn(), setView: vi.fn(), user: null, cartCount: 0,
      navigate: vi.fn(),
    };
    const t = { login: 'Login', myOrders: 'My Orders', logout: 'Sign out', searchAll: 'Search all products...', language: 'عربي' };
    const { container } = render(<Navbar store={store} t={t} />);
    fireEvent.click(screen.getByText('Login'));
    const modal = screen.getByText('Login').closest('div');
    const email = modal.querySelector('input[type="email"]');
    const pwd = modal.querySelector('input[type="password"]');
    fireEvent.change(email, { target: { value: 'a@b.c' } });
    fireEvent.change(pwd, { target: { value: 'x' } });
    const submit = Array.from(modal.querySelectorAll('button')).find(b=>b.textContent==='Login');
    fireEvent.click(submit);
    await waitFor(() => expect(screen.queryByText('Login')).toBeInTheDocument());
  });
});


