# CIDR Calculator

Calculate subnet details from IPv4 CIDR notation.

## How to use

1. Enter a CIDR block (e.g. `192.168.1.0/24`).
2. View network details instantly.

## Output fields

| Field | Example (`10.0.0.0/24`) |
|-------|-------------------------|
| Network address | `10.0.0.0` |
| Subnet mask | `255.255.255.0` |
| Wildcard mask | `0.0.0.255` |
| Broadcast | `10.0.0.255` |
| First host | `10.0.0.1` |
| Last host | `10.0.0.254` |
| Total addresses | 256 |
| Usable hosts | 254 |

## IP membership check

Enter an IP address to check whether it falls within the CIDR range.

## Smart paste

Paste a CIDR like `10.0.0.0/8` anywhere to auto-open this tool.

## Tips

- IPv4 only.
- Useful for firewall rules, VPC planning, and network troubleshooting.
