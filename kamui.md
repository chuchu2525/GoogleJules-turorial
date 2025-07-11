ありがとうございます！以下に**すべてマークダウン形式で正しく表示される `.md` ファイル内容**を再掲します。
このまま `kamui-style-workflow.md` として保存・共有していただけます。

---

```markdown
# Kamui 式 Claude Code ワークフロー設計ドキュメント（2 並列構成）

## 🎯 目的

Claude Code CLI（または SDK）を活用し、GitHub Actions 上でエージェントを並列に実行しながら、
AI がコード実装 → テスト実行 → 結果評価までを自律的に行う "Kamui 式開発フロー" を再現する。

この構成により、**人間が実装せずに AI エージェントが自律的に実装を繰り返す開発サイクル**を実現する。

---

## ⚙ システム構成（2 並列エージェント）
```

Claude Agent A ──┐
├─> 出力（fizzbuzz.py） → pytest → 結果出力
Claude Agent B ──┘

```

- Claude 2体が同じプロンプトに基づいて並列でコードを生成
- それぞれの出力を `.py` として保存し `pytest` にかける
- 成功/失敗ログと Claude 出力を GitHub Actions Artifacts として保存

---

## 📂 ディレクトリ構成

```

your-repo/
├── .github/
│ └── workflows/
│ └── claude.yml # 本ワークフロー定義ファイル
├── modules/ # Claude の出力を agent ごとに保存
│ ├── agent-a/
│ │ └── fizzbuzz.py
│ └── agent-b/
│ └── fizzbuzz.py
├── tests/
│ └── test_fizzbuzz.py # 仕様を兼ねるテスト

````

---

## ✅ 前提条件

- Claude API キーを GitHub Secrets に `ANTHROPIC_API_KEY` で登録済み
- Node.js CLI が使用できる環境（Actions上で自動インストール）
- `tests/test_fizzbuzz.py` が存在しており、関数 `fizzbuzz(n: int)` を検証するようになっている

---

## 🧪 テスト例（test_fizzbuzz.py）

```python
from fizzbuzz import fizzbuzz

def test_fizzbuzz_basic():
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(15) == "FizzBuzz"
    assert fizzbuzz(2) == "2"
````

---

## 🧱 Claude 実装プロンプト（CLI）

```bash
claude -p "FizzBuzzをPython関数 fizzbuzz(n: int) -> str で実装してください。仕様：3の倍数はFizz、5の倍数はBuzz、15の倍数はFizzBuzz、それ以外は数字の文字列を返す。"
```

---

## 📄 GitHub Actions ワークフロー（claude.yml 概要）

- `matrix: [agent-a, agent-b]` により 2 並列 Claude を起動
- 出力を `.py` として保存、各自 `pytest` を実行
- テスト結果と出力をログ＆Artifact に保存

---

## ⚠️ トラブル対策

| 症状                                          | 対策                                                                |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `Error: The operation was canceled.`          | Claude API Key 無効、または CLI 内部エラー → `--debug` をつけて診断 |
| `cp: 'tests' and './tests' are the same file` | `cp -r tests .` を削除（不必要なコピー）                            |
| Claude 出力が空                               | API Key の指定漏れ／rate limit → `.py` の `cat` ステップで確認      |

---

## 🔁 発展構成（今後）

- Claude 出力をスコアリングして「ベスト案」を保存
- 失敗コードを Critic Claude に渡して改善指示をもらう
- Claude にテスト自体も生成させる（TDD 構成）
- Claude 出力に `mypy` / `black` / `cyclomatic complexity` など静的評価を追加

---

## 📚 Kamui 式の本質的価値

- AI を「チャット相手」ではなく「実装エージェント」として扱う構造
- Claude に \*\*責務（テスト通過）と自由度（多様な案）\*\*を持たせる
- 人間の開発労力を「ワークフロー設計・仕様定義」に集中させる
- AI エージェントを組織化・定型化・自律化する“XOps”視点の導入

---

## 📝 メモ

- Claude CLI: [`@anthropic-ai/claude-code`](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- Claude API Key は `ANTHROPIC_API_KEY` として GitHub に登録
- Artifacts から出力 `.py` と `test_result.txt` をダウンロードして確認可能

---

## ✨ Next Ideas

- `critic.yml`: Critic Claude に改善案を出させて再プロンプト
- `verdict.yml`: 出力の品質スコアリング＋ベスト案選定
- `memory/`: 過去ベスト出力を保存し、Claude に強化学習的に渡す構成

```

---

必要に応じて：

- YAMLファイル付きでリポジトリテンプレ化
- Notion向けに整形
- 英語版 `kamui-style-workflow.en.md`

なども提供できます。次に進めたい方向があれば気軽にどうぞ！
```
