const request = require('supertest');
const app = require('../src/app');

describe('Todo API', () => {
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(200);
      
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
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
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
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
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/999')
        .send({ title: 'Updated Title' })
        .expect(404);

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
        .delete('/api/todos/999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});