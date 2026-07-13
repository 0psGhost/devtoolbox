# Random String

Generate random strings for passwords, tokens, and test data.

## How to use

1. Set **length** and character sets:
   - Uppercase (A–Z)
   - Lowercase (a–z)
   - Numbers (0–9)
   - Symbols
2. Click **Generate**.
3. Copy the result.

## Tips

- Enable multiple character sets for stronger passwords.
- Uses `crypto.getRandomValues` for randomness (browser CSPRNG).

## Security note

For production secrets, also follow your organisation's password policy. This tool helps generate candidates locally — nothing is sent over the network.
