try:
    from fizzbuzz import fizzbuzz
except ImportError:
    try:
        from implementation import fizzbuzz
    except ImportError:
        print("実装ファイルが見つかりません")
        exit(1)

def test_fizzbuzz():
    assert fizzbuzz(15) == "FizzBuzz"
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(2) == "2"
