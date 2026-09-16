import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import Verify from '../pages/Verify';
import api from '../services/api';
vi.mock('../services/api', () => ({ default: { get: vi.fn() } }));
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });
const show = (url) => render(<StrictMode><MemoryRouter initialEntries={[url]}><Routes><Route path="/verify" element={<Verify />} /><Route path="/login" element={<p>Login destination</p>} /></Routes></MemoryRouter></StrictMode>);
it('verifies once in StrictMode and redirects to the local login route', async () => {
  vi.useFakeTimers();
  api.get.mockResolvedValue({ data: 'Verified' });
  show('/verify?token=token%26test');
  await act(async () => {});
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledWith('/auth/verify', { params: { token: 'token&test' } });
  expect(screen.getByText('Email u verifikua!')).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(2500); });
  expect(screen.getByText('Login destination')).toBeInTheDocument();
});
it('does not redirect when verification fails', async () => {
  api.get.mockRejectedValue(new Error('Invalid'));
  show('/verify?token=invalid');
  expect(await screen.findByText('Verifikimi dështoi')).toBeInTheDocument();
  expect(screen.queryByText('Login destination')).not.toBeInTheDocument();
});
it('rejects missing tokens without an API request', () => {
  show('/verify');
  expect(api.get).not.toHaveBeenCalled();
  expect(screen.getByText('Verifikimi dështoi')).toBeInTheDocument();
});
