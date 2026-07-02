import {
  Braces, Binary, Link, Hash, Fingerprint, Clock, Regex,
  Code, Calculator, Type, GitCompare, Shuffle, FileText, Wand2, Shield, KeyRound,
  Timer, Network, Container,
} from 'lucide-react'
import { type ToolDefinition } from '../types/tool'

import JsonFormatter from './json-formatter/JsonFormatter'
import Base64Tool from './base64/Base64Tool'
import UrlTool from './url/UrlTool'
import HashGenerator from './hash/HashGenerator'
import UuidGenerator from './uuid/UuidGenerator'
import JwtDebugger from './jwt/JwtDebugger'
import UnixTimeConverter from './unix-time/UnixTimeConverter'
import RegExpTester from './regex/RegExpTester'
import YamlJsonConverter from './yaml-json/YamlJsonConverter'
import HtmlEntityTool from './html-entity/HtmlEntityTool'
import NumberBaseConverter from './number-base/NumberBaseConverter'
import LoremIpsumGenerator from './lorem/LoremIpsumGenerator'
import StringCaseConverter from './string-case/StringCaseConverter'
import TextDiff from './text-diff/TextDiff'
import QueryStringTool from './query-string/QueryStringTool'
import RandomStringGenerator from './random-string/RandomStringGenerator'
import HexAsciiConverter from './hex-ascii/HexAsciiConverter'
import CertificateManager from './certificate/CertificateManager'
import PgpManager from './pgp/PgpManager'
import CronParser from './cron/CronParser'
import CidrCalculator from './cidr/CidrCalculator'
import K8sValidator from './k8s/K8sValidator'

export const tools: ToolDefinition[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON',
    category: 'format',
    icon: Braces,
    component: JsonFormatter,
    keywords: ['json', 'format', 'validate', 'prettify', 'minify'],
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    description: 'Convert between YAML and JSON',
    category: 'format',
    icon: FileText,
    component: YamlJsonConverter,
    keywords: ['yaml', 'json', 'convert'],
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts side by side',
    category: 'format',
    icon: GitCompare,
    component: TextDiff,
    keywords: ['diff', 'compare', 'text'],
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Encode and decode Base64 strings',
    category: 'encode',
    icon: Binary,
    component: Base64Tool,
    keywords: ['base64', 'encode', 'decode'],
  },
  {
    id: 'url',
    name: 'URL Encode',
    description: 'Encode and decode URL strings',
    category: 'encode',
    icon: Link,
    component: UrlTool,
    keywords: ['url', 'encode', 'decode', 'uri'],
  },
  {
    id: 'html-entity',
    name: 'HTML Entities',
    description: 'Encode and decode HTML entities',
    category: 'encode',
    icon: Code,
    component: HtmlEntityTool,
    keywords: ['html', 'entity', 'encode', 'decode'],
  },
  {
    id: 'hex-ascii',
    name: 'Hex ↔ ASCII',
    description: 'Convert between hex and ASCII',
    category: 'encode',
    icon: Hash,
    component: HexAsciiConverter,
    keywords: ['hex', 'ascii', 'convert'],
  },
  {
    id: 'query-string',
    name: 'Query String ↔ JSON',
    description: 'Convert query strings to JSON',
    category: 'convert',
    icon: Shuffle,
    component: QueryStringTool,
    keywords: ['query', 'string', 'url', 'params'],
  },
  {
    id: 'number-base',
    name: 'Number Base',
    description: 'Convert between number bases',
    category: 'convert',
    icon: Calculator,
    component: NumberBaseConverter,
    keywords: ['binary', 'hex', 'octal', 'decimal', 'base'],
  },
  {
    id: 'string-case',
    name: 'String Case',
    description: 'Convert string casing styles',
    category: 'convert',
    icon: Type,
    component: StringCaseConverter,
    keywords: ['camelcase', 'snake_case', 'kebab', 'case'],
  },
  {
    id: 'unix-time',
    name: 'Unix Time',
    description: 'Convert Unix timestamps to dates',
    category: 'convert',
    icon: Clock,
    component: UnixTimeConverter,
    keywords: ['unix', 'timestamp', 'epoch', 'time', 'date'],
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA hashes',
    category: 'generate',
    icon: Hash,
    component: HashGenerator,
    keywords: ['hash', 'md5', 'sha256', 'sha1'],
  },
  {
    id: 'uuid',
    name: 'UUID Generator',
    description: 'Generate and validate UUIDs',
    category: 'generate',
    icon: Fingerprint,
    component: UuidGenerator,
    keywords: ['uuid', 'guid', 'generate'],
  },
  {
    id: 'lorem',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text',
    category: 'generate',
    icon: Wand2,
    component: LoremIpsumGenerator,
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
  },
  {
    id: 'random-string',
    name: 'Random String',
    description: 'Generate random strings',
    category: 'generate',
    icon: Shuffle,
    component: RandomStringGenerator,
    keywords: ['random', 'string', 'password', 'token'],
  },
  {
    id: 'certificate',
    name: 'Certificate Manager',
    description: 'Generate, validate, and inspect X.509 certificates, CSRs, and keys',
    category: 'inspect',
    icon: Shield,
    component: CertificateManager,
    keywords: ['certificate', 'x509', 'ssl', 'tls', 'pem', 'csr', 'ca', 'chain', 'generate', 'validate', 'key'],
  },
  {
    id: 'pgp',
    name: 'PGP / GPG',
    description: 'OpenPGP key generation, encryption, and signing',
    category: 'inspect',
    icon: KeyRound,
    component: PgpManager,
    keywords: ['pgp', 'gpg', 'openpgp', 'encrypt', 'sign', 'key', 'gnupg'],
  },
  {
    id: 'jwt',
    name: 'JWT Debugger',
    description: 'Decode JSON Web Tokens',
    category: 'inspect',
    icon: Braces,
    component: JwtDebugger,
    keywords: ['jwt', 'token', 'decode', 'debug'],
  },
  {
    id: 'regex',
    name: 'RegExp Tester',
    description: 'Test regular expressions',
    category: 'inspect',
    icon: Regex,
    component: RegExpTester,
    keywords: ['regex', 'regexp', 'pattern', 'test'],
  },
  {
    id: 'cron',
    name: 'Cron Parser',
    description: 'Parse cron expressions and preview schedules',
    category: 'devops',
    icon: Timer,
    component: CronParser,
    keywords: ['cron', 'crontab', 'schedule', 'job', 'timer'],
  },
  {
    id: 'cidr',
    name: 'CIDR Calculator',
    description: 'Calculate subnets, masks, and host ranges',
    category: 'devops',
    icon: Network,
    component: CidrCalculator,
    keywords: ['cidr', 'subnet', 'ip', 'network', 'mask', 'ipv4'],
  },
  {
    id: 'k8s',
    name: 'K8s Validator',
    description: 'Validate Kubernetes YAML manifests',
    category: 'devops',
    icon: Container,
    component: K8sValidator,
    keywords: ['kubernetes', 'k8s', 'yaml', 'manifest', 'deployment', 'pod'],
  },
]
