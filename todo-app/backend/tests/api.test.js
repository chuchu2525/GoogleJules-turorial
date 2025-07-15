const request = require('supertest');
let app;

// 動的にアプリをインポート（複数の場所から試行）
function loadApp() {
  const appPaths = [
    '../src/app',
    '../app',
    './app',
    '../backend_implementation_backend-agent-a',
    '../backend_implementation_backend-agent-b'
  ];
  
  for (const path of appPaths) {
    try {
      app = require(path);
      if (app && (typeof app === 'function' || app.listen)) {
        return app;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('アプリケーションファイルが見つかりません');
}

// テスト開始前にアプリをロード
beforeAll(() => {
  app = loadApp();
});

describe('Todo API - 包括的テストスイート', () => {
  
  describe('基本的なサーバー機能', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
    }, 10000);

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/todos')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array when no todos exist', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(expect.any(Array));
    });

    it('should have proper response structure', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('data');
      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo for GET' });

      const todoId = createResponse.body.data.id;

      // Then get it
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(todoId);
      expect(response.body.data.title).toBe('Test Todo for GET');
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .get('/api/todos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        title: 'Test Todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('Test Todo');
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
    });

    it('should create todo with default completed status', async () => {
      const newTodo = {
        title: 'Default Status Todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body.data.completed).toBe(false);
    });

    it('should create todo with specified completed status', async () => {
      const newTodo = {
        title: 'Completed Todo',
        completed: true
      };

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body.data.completed).toBe(true);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('title');
    });

    it('should return 400 if title is empty string', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 if title is not a string', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 123 })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should handle long titles', async () => {
      const longTitle = 'A'.repeat(1000);
      const response = await request(app)
        .post('/api/todos')
        .send({ title: longTitle })
        .expect(201);

      expect(response.body.data.title).toBe(longTitle);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Original Title' });

      const todoId = createResponse.body.data.id;

      // Then update it
      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Title', completed: true })
        .expect(200);

      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.data.title).toBe('Updated Title');
      expect(updateResponse.body.data.completed).toBe(true);
      expect(updateResponse.body.data.id).toBe(todoId);
    });

    it('should update only title', async () => {
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Original Title' });

      const todoId = createResponse.body.data.id;

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'New Title Only' })
        .expect(200);

      expect(updateResponse.body.data.title).toBe('New Title Only');
      expect(updateResponse.body.data.completed).toBe(false);
    });

    it('should update only completed status', async () => {
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.data.id;

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true })
        .expect(200);

      expect(updateResponse.body.data.title).toBe('Test Todo');
      expect(updateResponse.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/999999')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for invalid data', async () => {
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'To Be Deleted' });

      const todoId = createResponse.body.data.id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');

      // Verify it's deleted
      await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(404);
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    it('should not affect other todos when deleting', async () => {
      // Create two todos
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Todo 1' });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Todo 2' });

      // Delete first todo
      await request(app)
        .delete(`/api/todos/${todo1.body.data.id}`)
        .expect(200);

      // Verify second todo still exists
      const response = await request(app)
        .get(`/api/todos/${todo2.body.data.id}`)
        .expect(200);

      expect(response.body.data.title).toBe('Todo 2');
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/todos')
        .expect(405);
    });

    it('should handle non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });

  describe('データ整合性', () => {
    it('should maintain data consistency across operations', async () => {
      // Create multiple todos
      const todos = [];
      for (let i = 1; i <= 5; i++) {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: `Todo ${i}` });
        todos.push(response.body.data);
      }

      // Get all todos
      const allTodos = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(allTodos.body.data.length).toBeGreaterThanOrEqual(5);

      // Update one todo
      await request(app)
        .put(`/api/todos/${todos[0].id}`)
        .send({ completed: true })
        .expect(200);

      // Delete one todo
      await request(app)
        .delete(`/api/todos/${todos[1].id}`)
        .expect(200);

      // Verify final state
      const finalTodos = await request(app)
        .get('/api/todos')
        .expect(200);

      const updatedTodo = finalTodos.body.data.find(t => t.id === todos[0].id);
      const deletedTodo = finalTodos.body.data.find(t => t.id === todos[1].id);

      expect(updatedTodo.completed).toBe(true);
      expect(deletedTodo).toBeUndefined();
    });
  });

  describe('パフォーマンステスト', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/todos')
            .send({ title: `Concurrent Todo ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
      });
    });

    it('should respond within reasonable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/todos')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // 1秒以内
    });
  });
});
