from __future__ import annotations


def luhn_checksum(number: str) -> int:
    digits = [int(ch) for ch in number if ch.isdigit()]
    checksum = 0
    parity = len(digits) % 2
    for idx, digit in enumerate(digits):
        if idx % 2 == parity:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10


def is_valid(number: str) -> bool:
    return luhn_checksum(number) == 0
