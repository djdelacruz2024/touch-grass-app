import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// jsdom can't decode images, so make every Image load instantly.
beforeAll(() => {
  Object.defineProperty(global.Image.prototype, 'src', {
    set() { setTimeout(() => this.onload && this.onload()); }
  });
  HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} });
  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,AAAA';
});

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

const logIn = async () => {
  await userEvent.type(screen.getByPlaceholderText(/enter username/i), 'sam');
  await userEvent.click(screen.getByRole('button', { name: /start touching grass/i }));
  await screen.findByText(/welcome back, sam/i);
};

const uploadPhoto = (container) => userEvent.upload(
  container.querySelector('input[type=file]:not([capture])'),
  new File(['photo'], 'grass.jpg', { type: 'image/jpeg' })
);

test('renders the login screen', () => {
  render(<App />);
  expect(screen.getByText(/touch some grass/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
});

test('start button is disabled until a username is entered', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /start touching grass/i })).toBeDisabled();
});

test('a passing photo shows the verdict and starts a streak', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      touching_grass: true,
      confidence: 'high',
      reason: 'A hand is resting on a lawn.',
      roast_or_praise: 'Nature approves.'
    })
  });
  const { container } = render(<App />);
  await logIn();
  await uploadPhoto(container);

  expect(await screen.findByText(/grass touched/i)).toBeInTheDocument();
  expect(screen.getByText('Nature approves.')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/analyze', expect.objectContaining({ method: 'POST' }));
  await waitFor(() => expect(screen.getByText('Streak').nextSibling).toHaveTextContent('1'));
});

test('a server error is shown and not counted as an attempt', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  fetch.mockResolvedValue({ ok: false, status: 502, json: async () => ({ error: 'Judge unavailable' }) });
  const { container } = render(<App />);
  await logIn();
  await uploadPhoto(container);

  expect(await screen.findByText(/couldn't check that photo/i)).toBeInTheDocument();
  expect(screen.getByText('Judge unavailable')).toBeInTheDocument();
  const saved = JSON.parse(localStorage.getItem('user:user:sam'));
  expect(saved.totalAttempts).toBe(0);
});

test('stays logged in after a reload', async () => {
  const { unmount } = render(<App />);
  await logIn();
  unmount();
  render(<App />);
  expect(await screen.findByText(/welcome back, sam/i)).toBeInTheDocument();
});
