import { getFileReplacementsFromEnv } from '../../src/helpers/fileReplacements'

describe('getFileReplacementsFromEnv', () => {
	it('handles no replacements', () => {
		const res = getFileReplacementsFromEnv({})
		expect(res).toEqual({})
	})

	it('ignores invalid env', () => {
		const res = getFileReplacementsFromEnv({
			// @ts-ignore
			replace: {}
		})
		expect(res).toEqual({})
	})

	it('handles invalid replacements', () => {
		const res = getFileReplacementsFromEnv({
			replace: [
				'one',
				'two:',
				'three:four'
			]
		})
		const entries = Object.entries(res)
		expect(res).toBeDefined()
		expect(entries.length).toBe(1)
		expect(entries[0]).toEqual([
			'three',
			'four'
		])
	})

	it('can parse replacements from a string', () => {
		const res = getFileReplacementsFromEnv({
			replace: 'one:two'
		})
		const entries = Object.entries(res)
		expect(res).toBeDefined()
		expect(entries.length).toBe(1)
		expect(entries[0]).toEqual([
			'one',
			'two'
		])
	})

	it('can parse multiple replacements from a string', () => {
		const res = getFileReplacementsFromEnv({
			replace: 'one:two,three:four'
		})
		const entries = Object.entries(res)
		expect(res).toBeDefined()
		expect(entries.length).toBe(2)
		expect(entries).toEqual([
			['one', 'two'],
			['three', 'four'],
		])
	})

	it('can parse replacements from an array', () => {
		const res = getFileReplacementsFromEnv({
			replace: [
				'one:two',
				'three:four'
			]
		})
		const entries = Object.entries(res)
		expect(res).toBeDefined()
		expect(entries.length).toBe(2)
		expect(entries).toEqual([
			['one', 'two'],
			['three', 'four'],
		])
	})

	it('can parse multiple replacements from an array', () => {
		const res = getFileReplacementsFromEnv({
			replace: [
				'one:two,three:four',
				'five:six'
			]
		})
		const entries = Object.entries(res)
		expect(res).toBeDefined()
		expect(entries.length).toBe(3)
		expect(entries).toEqual([
			['one', 'two'],
			['three', 'four'],
			['five', 'six'],
		])
	})
});
