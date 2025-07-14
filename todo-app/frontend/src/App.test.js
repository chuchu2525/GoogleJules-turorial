import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

describe('Todo App', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders todo app heading', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: []
      })
    });

    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  test('displays todos from API', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', completed: false },
      { id: 2, title: 'Test Todo 2', completed: true }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: mockTodos
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('can add a new todo', async () => {
    // Mock initial empty todos
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: []
      })
    });

    // Mock create todo response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: { id: 1, title: 'New Todo', completed: false }
      })
    });

    render(<App />);

    const input = screen.getByPlaceholderText(/add.*todo/i);
    const button = screen.getByText(/add/i);

    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Todo' })
      });
    });
  });

  test('can toggle todo completion', async () => {
    const mockTodo = { id: 1, title: 'Test Todo', completed: false };

    // Mock initial todos
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: [mockTodo]
      })
    });

    // Mock update response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: { ...mockTodo, completed: true }
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      });
    });
  });

  test('can delete a todo', async () => {
    const mockTodo = { id: 1, title: 'Test Todo', completed: false };

    // Mock initial todos
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        data: [mockTodo]
      })
    });

    // Mock delete response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        message: 'Todo deleted successfully'
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE'
      });
    });
  });
});