import { fmt } from '../src/lib/utils/format'

describe('Format utilities', () => {
  it('formats BWP currency correctly', () => {
    const result = fmt.currency(1500)
    expect(result).toContain('1')
    expect(result).toContain('500')
  })

  it('formats distance correctly', () => {
    expect(fmt.distance(436)).toBe('436 km')
    expect(fmt.distance(1500)).toBe('1.5 Mm')
  })

  it('formats duration correctly', () => {
    expect(fmt.duration(2.5)).toBe('2h 30m')
    expect(fmt.duration(4)).toBe('4h')
  })

  it('formats weight correctly', () => {
    expect(fmt.weight(500)).toBe('500kg')
    expect(fmt.weight(2500)).toBe('2.5t')
  })

  it('generates initials correctly', () => {
    expect(fmt.initials('Thabo Mokoena')).toBe('TM')
    expect(fmt.initials('Neo')).toBe('N')
  })
})
