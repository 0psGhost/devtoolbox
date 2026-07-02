export interface CidrResult {
  valid: boolean
  input: string
  ip?: string
  prefix?: number
  network?: string
  broadcast?: string
  firstHost?: string
  lastHost?: string
  subnetMask?: string
  wildcardMask?: string
  totalAddresses?: number
  usableHosts?: number
  ipClass?: string
  binary?: { ip: string; mask: string }
  error?: string
}

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IPv4 address')
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function toBinary(ip: string): string {
  return ip.split('.').map((o) => parseInt(o, 10).toString(2).padStart(8, '0')).join('.')
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return 'A'
  if (firstOctet < 192) return 'B'
  if (firstOctet < 224) return 'C'
  if (firstOctet < 240) return 'D (Multicast)'
  return 'E (Reserved)'
}

export function parseCidr(input: string): CidrResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { valid: false, input: '', error: 'Enter a CIDR notation (e.g. 192.168.1.0/24)' }
  }

  const match = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?:\/(\d{1,2}))?$/)
  if (!match) {
    return { valid: false, input: trimmed, error: 'Invalid format. Use IPv4/CIDR like 10.0.0.0/8' }
  }

  const ip = match[1]
  const prefix = match[2] !== undefined ? parseInt(match[2], 10) : 32

  if (prefix < 0 || prefix > 32) {
    return { valid: false, input: trimmed, error: 'Prefix must be between 0 and 32' }
  }

  try {
    const ipInt = ipToInt(ip)
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const networkInt = (ipInt & mask) >>> 0
    const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0
    const totalAddresses = prefix === 32 ? 1 : Math.pow(2, 32 - prefix)
    const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalAddresses - 2
    const hasHostBits = prefix < 31

    return {
      valid: true,
      input: trimmed,
      ip,
      prefix,
      network: intToIp(networkInt),
      broadcast: intToIp(broadcastInt),
      firstHost: intToIp(hasHostBits ? networkInt + 1 : networkInt),
      lastHost: intToIp(hasHostBits ? broadcastInt - 1 : broadcastInt),
      subnetMask: intToIp(mask),
      wildcardMask: intToIp((~mask) >>> 0),
      totalAddresses,
      usableHosts: Math.max(0, usableHosts),
      ipClass: getIpClass(parseInt(ip.split('.')[0], 10)),
      binary: { ip: toBinary(ip), mask: toBinary(intToIp(mask)) },
    }
  } catch (e) {
    return { valid: false, input: trimmed, error: (e as Error).message }
  }
}

export function isIpInCidr(ip: string, cidr: string): boolean {
  const result = parseCidr(cidr)
  if (!result.valid || !result.network || result.prefix === undefined) return false
  try {
    const mask = result.prefix === 0 ? 0 : (~0 << (32 - result.prefix)) >>> 0
    return (ipToInt(ip) & mask) >>> 0 === ipToInt(result.network)
  } catch {
    return false
  }
}
