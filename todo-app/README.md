# Todo App - Claude並列開発プロジェクト

## プロジェクト概要

Claude Code を使ったフロントエンド・バックエンド並列開発の実証実験プロジェクト

## 技術スタック

### バックエンド
- **言語**: Node.js + Express
- **データベース**: SQLite
- **認証**: JWT (オプション)
- **テスト**: Jest + Supertest

### フロントエンド
- **言語**: React + TypeScript
- **スタイル**: CSS Modules または Tailwind CSS
- **状態管理**: React Hooks
- **テスト**: Jest + React Testing Library

## API仕様

### エンドポイント
- `GET /api/todos` - Todo一覧取得
- `POST /api/todos` - Todo作成
- `PUT /api/todos/:id` - Todo更新
- `DELETE /api/todos/:id` - Todo削除

### データ構造
```json
{
  "id": 1,
  "title": "サンプルタスク",
  "completed": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## 開発フロー

1. **並列開発**: Claude エージェントがフロント・バック同時実装
2. **自動テスト**: 生成コードの品質チェック
3. **PR作成**: 成功実装の自動プルリクエスト
4. **人間レビュー**: 最終的な品質確認・統合

## ディレクトリ構造

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   └── models/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── tests/
│   └── package.json
└── README.md
```

## セットアップ手順

1. 各ディレクトリで依存関係をインストール
2. データベースを初期化
3. バックエンドを起動
4. フロントエンドを起動
5. http://localhost:3000 でアクセス

## 実行コマンド

```bash
# バックエンド
cd backend
npm install
npm start

# フロントエンド
cd frontend
npm install
npm start
```