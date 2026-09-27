import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login screen', () => {
  render(<App />);
  expect(screen.getByText(/touch some grass/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
});

test('start button is disabled until a username is entered', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /start touching grass/i })).toBeDisabled();
});
