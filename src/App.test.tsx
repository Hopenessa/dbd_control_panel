import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders streamer queue controls', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /очередь заказов/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /рандомный киллер/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /рандомный сурв/i })).toBeInTheDocument();
});
