import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 動的にAppコンポーネントをインポート
let App;
function loadApp() {
  const appPaths = [
    './App',
    '../App',
    './frontend_implementation_frontend-agent-a',
    './frontend_implementation_frontend-agent-b'
  ];
  
  for (const path of appPaths) {
    try {
      const module = require(path);
      App = module.default || module;
      if (App && typeof App === 'function') {
        return App;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Appコンポーネントが見つかりません');
}

// テスト開始前にAppをロード
beforeAll(() => {
  App = loadApp();
});

// Mock fetch
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('Todo App - 包括的テストスイート', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  describe('基本的なレンダリング', () => {
    test('renders todo app heading', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: []
        })
      });

      await act(async () => {
        render(<App />);
      });

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/todo/i);
    });

    test('renders input field for new todos', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: []
        })
      });

      await act(async () => {
        render(<App />);
      });

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder');
    });

    test('renders add button', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: []
        })
      });

      await act(async () => {
        render(<App />);
      });

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeInTheDocument();
    });

    test('shows loading state initially', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<App />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Todo表示機能', () => {
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

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
      });
    });

    test('displays empty state when no todos', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: []
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/no todos/i) || screen.getByText(/empty/i)).toBeInTheDocument();
      });
    });

    test('shows completed todos with different styling', async () => {
      const mockTodos = [
        { id: 1, title: 'Active Todo', completed: false },
        { id: 2, title: 'Completed Todo', completed: true }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTodos
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        const completedTodo = screen.getByText('Completed Todo');
        const activeTodo = screen.getByText('Active Todo');
        
        expect(completedTodo).toBeInTheDocument();
        expect(activeTodo).toBeInTheDocument();
        
        // Check if completed todo has different styling (class or style)
        const completedElement = completedTodo.closest('li') || completedTodo.parentElement;
        const activeElement = activeTodo.closest('li') || activeTodo.parentElement;
        
        expect(completedElement.className).not.toBe(activeElement.className);
      });
    });
  });

  describe('Todo追加機能', () => {
    test('can add a new todo', async () => {
      const user = userEvent.setup();

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

      await act(async () => {
        render(<App />);
      });

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /add/i });

      await user.type(input, 'New Todo');
      await user.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Todo' })
        });
      });
    });

    test('clears input after adding todo', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: [] })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { id: 1, title: 'New Todo', completed: false }
        })
      });

      await act(async () => {
        render(<App />);
      });

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /add/i });

      await user.type(input, 'New Todo');
      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    test('does not add empty todo', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: [] })
      });

      await act(async () => {
        render(<App />);
      });

      const button = screen.getByRole('button', { name: /add/i });
      await user.click(button);

      expect(fetch).toHaveBeenCalledTimes(1); // Only initial fetch
    });

    test('handles add todo error', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: [] })
      });

      fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<App />);
      });

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /add/i });

      await user.type(input, 'New Todo');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Todo完了切り替え機能', () => {
    test('can toggle todo completion', async () => {
      const user = userEvent.setup();
      const mockTodo = { id: 1, title: 'Test Todo', completed: false };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [mockTodo]
        })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { ...mockTodo, completed: true }
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true })
        });
      });
    });

    test('can toggle completed todo back to active', async () => {
      const user = userEvent.setup();
      const mockTodo = { id: 1, title: 'Test Todo', completed: true };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [mockTodo]
        })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { ...mockTodo, completed: false }
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();

      await user.click(checkbox);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: false })
        });
      });
    });
  });

  describe('Todo削除機能', () => {
    test('can delete a todo', async () => {
      const user = userEvent.setup();
      const mockTodo = { id: 1, title: 'Test Todo', completed: false };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [mockTodo]
        })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Todo deleted successfully'
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
          method: 'DELETE'
        });
      });
    });

    test('removes todo from UI after deletion', async () => {
      const user = userEvent.setup();
      const mockTodo = { id: 1, title: 'Test Todo', completed: false };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [mockTodo]
        })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Todo deleted successfully'
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('handles API fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    test('handles invalid API response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('ユーザビリティ', () => {
    test('allows adding todo with Enter key', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: [] })
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { id: 1, title: 'New Todo', completed: false }
        })
      });

      await act(async () => {
        render(<App />);
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'New Todo');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Todo' })
        });
      });
    });

    test('shows todo count', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', completed: false },
        { id: 2, title: 'Todo 2', completed: true },
        { id: 3, title: 'Todo 3', completed: false }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockTodos
        })
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/3/)).toBeInTheDocument();
      });
    });

    test('is responsive and accessible', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'success', data: [] })
      });

      await act(async () => {
        render(<App />);
      });

      // Check for proper ARIA labels and roles
      expect(screen.getByRole('main') || screen.getByRole('application')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  describe('パフォーマンス', () => {
    test('handles large number of todos', async () => {
      const largeTodoList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Todo ${i + 1}`,
        completed: i % 2 === 0
      }));

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: largeTodoList
        })
      });

      const start = performance.now();
      
      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Todo 1')).toBeInTheDocument();
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(2000); // Should render within 2 seconds
    });
  });
});
