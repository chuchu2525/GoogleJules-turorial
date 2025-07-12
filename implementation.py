def fizzbuzz(n: int) -> str:
    """
    FizzBuzz関数の実装例
    Pylanceの警告を解決するためのダミーファイル
    """
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)