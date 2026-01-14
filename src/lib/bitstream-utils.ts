export interface BitstreamFile {
  name: string
  size: number
  rawContent: string
  decodedContent?: string
  isValid: boolean
  parseError?: string
}

export interface Anomaly {
  type: 'WORD' | 'EQUATION' | 'CODE' | 'ENTITY' | 'UNKNOWN'
  item: string
  reason: string
  position?: number
  line?: number
  severity: 'low' | 'medium' | 'high'
}

export interface AuditReport {
  generated: string
  model: string
  anomalies: Anomaly[]
  total: number
  bufferSize: number
  systemStatus?: {
    bridgeStatus: string
    bufferLength: number
    timestamp: string
  }
  customNotes?: string
}

/**
 * Parse binary or text file and extract content
 */
export async function parseBitstreamFile(file: File): Promise<BitstreamFile> {
  const result: BitstreamFile = {
    name: file.name,
    size: file.size,
    rawContent: '',
    isValid: false
  }

  try {
    // Read file as text
    const rawContent = await file.text()
    result.rawContent = rawContent

    // Check if file appears to be binary or text
    const isBinary = /[\x00-\x1F\x7F-\x9F]/.test(rawContent.substring(0, 1000))

    if (isBinary) {
      result.parseError = 'File appears to be binary and cannot be parsed as text'
      return result
    }

    // Try to decode if it's a binary representation
    result.decodedContent = decodeBitstream(rawContent)
    result.isValid = true

    return result
  } catch (error) {
    result.parseError = error instanceof Error ? error.message : 'Unknown error'
    return result
  }
}

/**
 * Decode bitstream format to text
 */
function decodeBitstream(content: string): string {
  // Remove non-binary characters
  const bits = content.replace(/[^01]/g, '')

  // Convert to text
  let decoded = ''
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.substring(i, i + 8)
    if (byte.length === 8) {
      decoded += String.fromCharCode(parseInt(byte, 2))
    }
  }

  return decoded.trim()
}

/**
 * Detect anomalies in content using heuristics
 */
export function detectAnomalies(content: string): Anomaly[] {
  const anomalies: Anomaly[] = []
  const lines = content.split('\n')

  // Patterns for different types of anomalies
  const patterns = {
    undefinedWords: /\b(undefined|undefined_variable|unknown_constant|delta_str|unknown_value|null_reference|void_parameter)\b/gi,
    undefinedEquations: /(Delta-[a-z]+|Unknown-[A-Z]+|Var_[0-9]+|X_[a-z]+|undef_[a-z]+)/g,
    anomalousCode: /(function\s+[a-z0-9]*\s*\(\s*\)\s*\{?\s*\}|class\s+[A-Z][a-z]+\s*\{?\s*\}|for\s*\(\s*[a-z]+\s*in\s*undefined\s*\))/g,
    undefinedEntities: /\b(ENTITY_[0-9]+|UNDEF_\w+|UNKNOWN_\w+|MYSTERY_\w+|ANOMALY_\w+)\b/gi
  }

  // Scan line by line
  lines.forEach((line, lineIndex) => {
    // Check for undefined words
    const words = patterns.undefinedWords.exec(line)
    if (words) {
      anomalies.push({
        type: 'WORD',
        item: words[0],
        reason: 'Jargon or term used without proper context or definition',
        position: content.indexOf(line),
        line: lineIndex + 1,
        severity: 'low'
      })
    }

    // Check for undefined equations
    const equations = patterns.undefinedEquations.exec(line)
    if (equations) {
      anomalies.push({
        type: 'EQUATION',
        item: equations[0],
        reason: 'Mathematical variable or constant not properly defined',
        position: content.indexOf(line),
        line: lineIndex + 1,
        severity: 'high'
      })
    }

    // Check for anomalous code fragments
    const code = patterns.anomalousCode.exec(line)
    if (code) {
      anomalies.push({
        type: 'CODE',
        item: code[0],
        reason: 'Code fragment lacks implementation or proper syntax',
        position: content.indexOf(line),
        line: lineIndex + 1,
        severity: 'high'
      })
    }

    // Check for undefined entities
    const entities = patterns.undefinedEntities.exec(line)
    if (entities) {
      anomalies.push({
        type: 'ENTITY',
        item: entities[0],
        reason: 'Named entity or concept without clear definition',
        position: content.indexOf(line),
        line: lineIndex + 1,
        severity: 'medium'
      })
    }
  })

  return anomalies
}

/**
 * Determine anomaly severity based on type
 */
export function getAnomalySeverity(type: string): 'low' | 'medium' | 'high' {
  const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'WORD': 'low',
    'ENTITY': 'medium',
    'EQUATION': 'high',
    'CODE': 'high',
    'UNKNOWN': 'low'
  }
  return severityMap[type] || 'low'
}

/**
 * Generate anomaly summary statistics
 */
export function generateAnomalyStats(anomalies: Anomaly[]) {
  const stats = {
    total: anomalies.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>
  }

  anomalies.forEach(anomaly => {
    stats.byType[anomaly.type] = (stats.byType[anomaly.type] || 0) + 1
    stats.bySeverity[anomaly.severity] = (stats.bySeverity[anomaly.severity] || 0) + 1
  })

  return stats
}

/**
 * Format file size for display
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Extract entities from text using regex
 */
export function extractEntities(text: string): string[] {
  const entityPatterns = [
    /\b[A-Z][a-z]+(?:System|Network|Data|Core|Vessel|Bridge|Matrix)\b/g,
    /\b(?:EMG|CORE|MEMORY|SYSTEM|NEURAL|QUANTUM|CYPBER)\b/gi,
    /\b(?:undefined|unknown|variable|parameter|constant)\s+[a-z0-9_]+/gi
  ]

  const entities: string[] = []
  entityPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(match => {
        if (!entities.includes(match)) {
          entities.push(match)
        }
      })
    }
  })

  return [...new Set(entities)] // Remove duplicates
}

/**
 * Validate bitstream content
 */
export function validateBitstream(content: string): {
  valid: boolean
  issues: string[]
  issues?: string[]
} {
  const issues: string[] = []

  // Check for common issues
  if (content.length === 0) {
    issues.push('Bitstream is empty')
  }

  if (content.length > 100000) {
    issues.push('Bitstream exceeds 100KB limit')
  }

  const nullMatches = content.match(/null|undefined|void)/gi)
  if (nullMatches && nullMatches.length > 10) {
    issues.push(`High frequency of null/undefined values: ${nullMatches.length} occurrences`)
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Sanitize bitstream content
 */
export function sanitizeBitstream(content: string): string {
  return content
    // Remove excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Trim
    .trim()
}
