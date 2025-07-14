# Todo App API仕様書

## 基本情報

- **ベースURL**: `http://localhost:3001/api`
- **認証**: なし（将来的にJWT対応予定）
- **データ形式**: JSON

## エンドポイント仕様

### 1. Todo一覧取得
```
GET /api/todos
```

**レスポンス**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "サンプルタスク",
      "completed": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Todo作成
```
POST /api/todos
```

**リクエストボディ**
```json
{
  "title": "新しいタスク"
}
```

**レスポンス**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "title": "新しいタスク",
    "completed": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Todo更新
```
PUT /api/todos/:id
```

**リクエストボディ**
```json
{
  "title": "更新されたタスク",
  "completed": true
}
```

**レスポンス**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "更新されたタスク",
    "completed": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 4. Todo削除
```
DELETE /api/todos/:id
```

**レスポンス**
```json
{
  "status": "success",
  "message": "Todo deleted successfully"
}
```

## エラーレスポンス

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid request data",
  "details": ["title is required"]
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Todo not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## データベーススキーマ

### todos テーブル
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## バリデーション

### Todo作成・更新
- `title`: 必須、文字列、1-200文字
- `completed`: オプション、boolean

## 使用例

### JavaScript (fetch)
```javascript
// Todo取得
const todos = await fetch('/api/todos').then(res => res.json());

// Todo作成
const newTodo = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '新しいタスク' })
}).then(res => res.json());

// Todo更新
const updatedTodo = await fetch(`/api/todos/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
}).then(res => res.json());

// Todo削除
await fetch(`/api/todos/${id}`, { method: 'DELETE' });
```