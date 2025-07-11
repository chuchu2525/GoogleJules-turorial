# GitHub Actions Claude 並列開発ワークフロー

## 概要

このワークフローは、GitHub Actions上で2つのClaudeエージェントを並列実行し、同じタスクに対して異なる実装を生成・テストする仕組みです。

## 主な機能

### 1. 並列エージェント実行
- `agent-a`と`agent-b`の2つのエージェントが並列で動作
- 各エージェントが独立してコードを生成

### 2. 汎用的なタスク対応
- `workflow_dispatch`でカスタムプロンプトを指定可能
- 複数のプログラミング言語に対応（Python, JavaScript, Go, Java）
- テストコマンドも設定可能

### 3. 自動テスト実行
- 生成されたコードを自動でテスト
- テスト結果をアーティファクトとして保存

### 4. 結果比較・評価
- 2つのエージェントの出力を比較
- 統合されたレポートを生成

## 使用方法

### 1. 手動実行（workflow_dispatch）
GitHubのActionsタブから手動実行が可能：
- **task_prompt**: Claudeに実行させるタスクの説明
- **programming_language**: 対象言語（python, javascript, go, java）
- **file_extension**: 生成ファイルの拡張子
- **test_command**: テスト実行コマンド

### 2. プッシュ時の自動実行
コードをプッシュすると自動的にデフォルトのFizzBuzzタスクが実行されます。

## 必要な設定

### GitHub Secrets
- `ANTHROPIC_API_KEY`: Claude APIキー

### テストファイル
- `tests/`ディレクトリ内にテストファイルを配置
- `test_fizzbuzz.py`が既存のサンプル

## 出力

### アーティファクト
- `agent-a-results`: エージェントAの実装とテスト結果
- `agent-b-results`: エージェントBの実装とテスト結果  
- `comparison-report`: 両エージェントの比較レポート

### ファイル構成
```
modules/
├── agent-a/
│   ├── implementation.py
│   └── test_result.txt
└── agent-b/
    ├── implementation.py
    └── test_result.txt
```

## 拡張可能性

- エージェント数の増減（matrixの変更）
- 複数のプロンプト戦略の並列実行
- コード品質メトリクスの追加
- より高度な結果評価・選択機能