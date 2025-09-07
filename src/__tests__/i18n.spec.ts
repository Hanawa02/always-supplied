import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

// Helper function to extract all keys from a nested object
function extractKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recursive case: object with nested properties
      const nestedKeys = extractKeys(obj[key], prefix ? `${prefix}.${key}` : key)
      keys.push(...nestedKeys)
    } else {
      // Base case: primitive value
      keys.push(prefix ? `${prefix}.${key}` : key)
    }
  }
  
  return keys.sort()
}

// Helper function to load and parse translation file
function loadTranslations(locale: string): any {
  const filePath = path.resolve(process.cwd(), `i18n/messages/${locale}.json`)
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`)
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

describe('Translation Key Consistency', () => {
  const supportedLocales = ['en', 'es', 'pt']
  let translationKeys: Record<string, string[]> = {}
  
  // Load all translation files and extract their keys
  supportedLocales.forEach(locale => {
    const translations = loadTranslations(locale)
    translationKeys[locale] = extractKeys(translations)
  })

  it('should have the same keys across all language files', () => {
    const enKeys = translationKeys.en
    const esKeys = translationKeys.es
    const ptKeys = translationKeys.pt

    // Check Spanish translations
    const missingInSpanish = enKeys.filter(key => !esKeys.includes(key))
    const extraInSpanish = esKeys.filter(key => !enKeys.includes(key))

    // Check Portuguese translations
    const missingInPortuguese = enKeys.filter(key => !ptKeys.includes(key))
    const extraInPortuguese = ptKeys.filter(key => !enKeys.includes(key))

    // Create detailed error messages
    const errors: string[] = []
    
    if (missingInSpanish.length > 0) {
      errors.push(`Missing keys in Spanish (es.json): ${missingInSpanish.join(', ')}`)
    }
    
    if (extraInSpanish.length > 0) {
      errors.push(`Extra keys in Spanish (es.json): ${extraInSpanish.join(', ')}`)
    }
    
    if (missingInPortuguese.length > 0) {
      errors.push(`Missing keys in Portuguese (pt.json): ${missingInPortuguese.join(', ')}`)
    }
    
    if (extraInPortuguese.length > 0) {
      errors.push(`Extra keys in Portuguese (pt.json): ${extraInPortuguese.join(', ')}`)
    }

    if (errors.length > 0) {
      throw new Error(`Translation key inconsistencies found:\n${errors.join('\n')}`)
    }

    // If we get here, all keys match
    expect(esKeys).toEqual(enKeys)
    expect(ptKeys).toEqual(enKeys)
  })

  it('should not have empty string values in any translation file', () => {
    supportedLocales.forEach(locale => {
      const translations = loadTranslations(locale)
      
      // Helper to find empty values recursively
      function findEmptyValues(obj: any, path = ''): string[] {
        const emptyKeys: string[] = []
        
        for (const key in obj) {
          const fullPath = path ? `${path}.${key}` : key
          const value = obj[key]
          
          if (typeof value === 'object' && value !== null) {
            emptyKeys.push(...findEmptyValues(value, fullPath))
          } else if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(fullPath)
          }
        }
        
        return emptyKeys
      }
      
      const emptyKeys = findEmptyValues(translations)
      
      if (emptyKeys.length > 0) {
        throw new Error(`Empty string values found in ${locale}.json: ${emptyKeys.join(', ')}`)
      }
    })
  })

  it('should have valid JSON structure in all translation files', () => {
    supportedLocales.forEach(locale => {
      expect(() => {
        loadTranslations(locale)
      }).not.toThrow(`Invalid JSON in ${locale}.json`)
    })
  })

  it('should have the same number of total keys in all files', () => {
    const enKeyCount = translationKeys.en.length
    const esKeyCount = translationKeys.es.length
    const ptKeyCount = translationKeys.pt.length

    expect(esKeyCount).toBe(enKeyCount)
    expect(ptKeyCount).toBe(enKeyCount)
  })

  it('should maintain consistent parameter usage in interpolated messages', () => {
    const enTranslations = loadTranslations('en')
    const esTranslations = loadTranslations('es')
    const ptTranslations = loadTranslations('pt')

    // Helper to extract parameter names from a message string
    function extractParameters(message: string): string[] {
      const matches = message.match(/\{(\w+)\}/g)
      return matches ? matches.map(match => match.slice(1, -1)).sort() : []
    }

    // Helper to check parameters recursively
    function checkParametersRecursively(enObj: any, esObj: any, ptObj: any, path = '') {
      for (const key in enObj) {
        const fullPath = path ? `${path}.${key}` : key
        const enValue = enObj[key]
        const esValue = esObj[key]
        const ptValue = ptObj[key]

        if (typeof enValue === 'object' && enValue !== null) {
          checkParametersRecursively(enValue, esValue, ptValue, fullPath)
        } else if (typeof enValue === 'string') {
          const enParams = extractParameters(enValue)
          
          if (enParams.length > 0) {
            const esParams = extractParameters(esValue)
            const ptParams = extractParameters(ptValue)
            
            expect(esParams).toEqual(enParams)
            expect(ptParams).toEqual(enParams)
          }
        }
      }
    }

    checkParametersRecursively(enTranslations, esTranslations, ptTranslations)
  })
})