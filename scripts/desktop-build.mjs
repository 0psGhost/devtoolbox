#!/usr/bin/env node
/**
 * Build a desktop installer for the current OS/architecture.
 * macOS: arm64 → aarch64-apple-darwin, x64 → x86_64-apple-darwin
 * Pass --universal to build a universal macOS binary instead.
 */

import { spawnSync } from 'node:child_process'
import { arch, platform } from 'node:os'

function macTarget() {
  if (process.argv.includes('--universal')) {
    return 'universal-apple-darwin'
  }
  return arch() === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin'
}

function resolveTarget() {
  const override = process.env.DESKTOP_BUILD_TARGET?.trim()
  if (override) return override

  if (platform() === 'darwin') return macTarget()
  return null
}

const target = resolveTarget()
const args = ['tauri', 'build']

if (target) {
  args.push('--target', target)
  console.log(`Building for target: ${target}`)
} else {
  console.log(`Building for native platform: ${platform()} (${arch()})`)
}

const result = spawnSync('npx', args, { stdio: 'inherit', shell: false })
process.exit(result.status ?? 1)
