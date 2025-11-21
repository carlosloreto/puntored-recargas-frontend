import { describe, it, expect } from 'vitest'
import { VALIDATION_RULES } from './constants'

describe('Validation Rules', () => {
    describe('Phone Number', () => {
        const phonePattern = VALIDATION_RULES.phoneNumber.pattern.value

        it('should match valid Colombian mobile numbers starting with 3', () => {
            expect(phonePattern.test('3001234567')).toBe(true)
            expect(phonePattern.test('3109876543')).toBe(true)
            expect(phonePattern.test('3210000000')).toBe(true)
        })

        it('should not match numbers not starting with 3', () => {
            expect(phonePattern.test('2001234567')).toBe(false)
            expect(phonePattern.test('1001234567')).toBe(false)
        })

        it('should not match numbers with incorrect length', () => {
            expect(phonePattern.test('300123456')).toBe(false) // 9 digits
            expect(phonePattern.test('30012345678')).toBe(false) // 11 digits
        })

        it('should not match non-numeric characters', () => {
            expect(phonePattern.test('300123456a')).toBe(false)
            expect(phonePattern.test('300-123456')).toBe(false)
        })
    })

    describe('Amount', () => {
        const amountValidation = VALIDATION_RULES.amount.validate

        it('should validate numbers correctly', () => {
            expect(amountValidation.isNumber(5000)).toBe(true)
            expect(amountValidation.isNumber('5000')).toBe(true)
            expect(amountValidation.isNumber('abc')).not.toBe(true)
        })

        it('should validate minimum amount', () => {
            expect(amountValidation.min(1000)).toBe(true)
            expect(amountValidation.min(5000)).toBe(true)
            expect(amountValidation.min(999)).not.toBe(true)
        })

        it('should validate maximum amount', () => {
            expect(amountValidation.max(100000)).toBe(true)
            expect(amountValidation.max(50000)).toBe(true)
            expect(amountValidation.max(100001)).not.toBe(true)
        })
    })

    describe('Email', () => {
        const emailPattern = VALIDATION_RULES.email.pattern.value

        it('should match valid emails', () => {
            expect(emailPattern.test('test@example.com')).toBe(true)
            expect(emailPattern.test('user.name@domain.co')).toBe(true)
        })

        it('should not match invalid emails', () => {
            expect(emailPattern.test('test@')).toBe(false)
            expect(emailPattern.test('test@domain')).toBe(false)
            expect(emailPattern.test('test')).toBe(false)
        })
    })
})
