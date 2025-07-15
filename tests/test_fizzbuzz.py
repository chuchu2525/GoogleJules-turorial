import pytest
import sys
import os

# 複数の場所から fizzbuzz 関数をインポートを試行
def import_fizzbuzz():
    """fizzbuzz関数を複数の場所から動的にインポート"""
    import_paths = [
        'fizzbuzz',
        'implementation', 
        'claude_generated_implementation',
        'output_agent-a',
        'output_agent-b'
    ]
    
    for module_name in import_paths:
        try:
            module = __import__(module_name)
            if hasattr(module, 'fizzbuzz'):
                return getattr(module, 'fizzbuzz')
        except ImportError:
            continue
    
    # パスを追加して再試行
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for module_name in import_paths:
        try:
            module = __import__(module_name)
            if hasattr(module, 'fizzbuzz'):
                return getattr(module, 'fizzbuzz')
        except ImportError:
            continue
    
    raise ImportError("fizzbuzz関数が見つかりません")

# グローバルに fizzbuzz 関数を取得
fizzbuzz = import_fizzbuzz()

class TestFizzBuzz:
    """FizzBuzz関数の包括的テストスイート"""
    
    def test_fizzbuzz_basic_cases(self):
        """基本的なFizzBuzzテストケース"""
        assert fizzbuzz(15) == "FizzBuzz"
        assert fizzbuzz(3) == "Fizz"
        assert fizzbuzz(5) == "Buzz"
        assert fizzbuzz(2) == "2"
        assert fizzbuzz(1) == "1"
    
    def test_fizzbuzz_multiples_of_3(self):
        """3の倍数のテスト"""
        assert fizzbuzz(6) == "Fizz"
        assert fizzbuzz(9) == "Fizz"
        assert fizzbuzz(12) == "Fizz"
        assert fizzbuzz(21) == "Fizz"
        assert fizzbuzz(33) == "Fizz"
    
    def test_fizzbuzz_multiples_of_5(self):
        """5の倍数のテスト"""
        assert fizzbuzz(10) == "Buzz"
        assert fizzbuzz(20) == "Buzz"
        assert fizzbuzz(25) == "Buzz"
        assert fizzbuzz(35) == "Buzz"
        assert fizzbuzz(50) == "Buzz"
    
    def test_fizzbuzz_multiples_of_15(self):
        """15の倍数（3と5の両方の倍数）のテスト"""
        assert fizzbuzz(30) == "FizzBuzz"
        assert fizzbuzz(45) == "FizzBuzz"
        assert fizzbuzz(60) == "FizzBuzz"
        assert fizzbuzz(75) == "FizzBuzz"
        assert fizzbuzz(90) == "FizzBuzz"
    
    def test_fizzbuzz_regular_numbers(self):
        """通常の数字（3でも5でも割り切れない）のテスト"""
        assert fizzbuzz(1) == "1"
        assert fizzbuzz(2) == "2"
        assert fizzbuzz(4) == "4"
        assert fizzbuzz(7) == "7"
        assert fizzbuzz(8) == "8"
        assert fizzbuzz(11) == "11"
        assert fizzbuzz(13) == "13"
        assert fizzbuzz(14) == "14"
        assert fizzbuzz(16) == "16"
        assert fizzbuzz(17) == "17"
    
    def test_fizzbuzz_edge_cases(self):
        """エッジケースのテスト"""
        # 大きな数
        assert fizzbuzz(150) == "FizzBuzz"
        assert fizzbuzz(300) == "FizzBuzz"
        assert fizzbuzz(999) == "Fizz"
        assert fizzbuzz(1000) == "Buzz"
        
        # 小さな数
        assert fizzbuzz(0) == "FizzBuzz"  # 0は3でも5でも割り切れる
    
    def test_fizzbuzz_type_validation(self):
        """型の検証テスト"""
        # 戻り値が文字列であることを確認
        assert isinstance(fizzbuzz(1), str)
        assert isinstance(fizzbuzz(3), str)
        assert isinstance(fizzbuzz(5), str)
        assert isinstance(fizzbuzz(15), str)
    
    def test_fizzbuzz_comprehensive_range(self):
        """1-100の範囲での包括的テスト"""
        expected_results = {
            3: "Fizz", 6: "Fizz", 9: "Fizz", 12: "Fizz", 18: "Fizz", 21: "Fizz", 24: "Fizz", 27: "Fizz",
            5: "Buzz", 10: "Buzz", 20: "Buzz", 25: "Buzz", 35: "Buzz", 40: "Buzz", 50: "Buzz", 55: "Buzz",
            15: "FizzBuzz", 30: "FizzBuzz", 45: "FizzBuzz", 60: "FizzBuzz", 75: "FizzBuzz", 90: "FizzBuzz"
        }
        
        for num, expected in expected_results.items():
            assert fizzbuzz(num) == expected, f"fizzbuzz({num}) should return '{expected}'"
        
        # 通常の数字のサンプルテスト
        regular_numbers = [1, 2, 4, 7, 8, 11, 13, 14, 16, 17, 19, 22, 23, 26, 28, 29]
        for num in regular_numbers:
            assert fizzbuzz(num) == str(num), f"fizzbuzz({num}) should return '{num}'"

# 後方互換性のための関数形式テスト
def test_fizzbuzz():
    """後方互換性のための基本テスト"""
    assert fizzbuzz(15) == "FizzBuzz"
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(2) == "2"

def test_fizzbuzz_extended():
    """拡張テストケース"""
    # より多くのテストケース
    test_cases = [
        (0, "FizzBuzz"),
        (1, "1"),
        (2, "2"),
        (3, "Fizz"),
        (4, "4"),
        (5, "Buzz"),
        (6, "Fizz"),
        (7, "7"),
        (8, "8"),
        (9, "Fizz"),
        (10, "Buzz"),
        (11, "11"),
        (12, "Fizz"),
        (13, "13"),
        (14, "14"),
        (15, "FizzBuzz"),
        (30, "FizzBuzz"),
        (45, "FizzBuzz"),
        (100, "Buzz"),
        (99, "Fizz"),
        (101, "101")
    ]
    
    for input_val, expected in test_cases:
        result = fizzbuzz(input_val)
        assert result == expected, f"fizzbuzz({input_val}) returned '{result}', expected '{expected}'"

if __name__ == "__main__":
    # テストの実行例
    pytest.main([__file__, "-v"])
