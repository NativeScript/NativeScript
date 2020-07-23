const { getIndentationCharacter, writePackageJson, safeGet } = require("./projectHelpers");
const fs = require("fs");

describe('projectHelpers', () => {
    const originalReadFileSync = fs.readFileSync;
    const originalWriteFileSync = fs.writeFileSync;
    const tab = "\t";
    const multipleSpaces = "        ";
    const twoSpaces = "  ";

    afterEach(() => {
        fs.readFileSync = originalReadFileSync;
        fs.writeFileSync = originalWriteFileSync;
    });

    describe('getIndentationCharacter', () => {
        [
            {
                testName: 'returns two spaces when file starts with two spaces',
                input: `{${twoSpaces}"abc": "1"${twoSpaces}}`,
                expectedResult: twoSpaces
			},
			{
                testName: 'returns two spaces when file starts with two spaces and binary content is passed',
                input: Buffer.from(`{${twoSpaces}"abc": "1"${twoSpaces}}`),
                expectedResult: twoSpaces
            },
            {
                testName: 'returns empty string when file starts without any indentation',
                input: `{"abc": "1"}`,
                expectedResult: ''
            },
            {
                testName: 'returns tab when file starts with tab',
                input: `{${tab}"abc": "1"${tab}}`,
                expectedResult: tab
            },
            {
                testName: 'returns two spaces when file starts with two spaces and new line before them',
                input: `{\n${twoSpaces}"abc": "1"\n}`,
                expectedResult: twoSpaces
            },
            {
                testName: 'returns tab when file starts with tab and new line before them',
                input: `{\n${tab}"abc": "1"\n}`,
                expectedResult: tab
            },
            {
                testName: 'returns multiple spaces when file starts with multiple spaces and new line before them',
                input: `{\n${multipleSpaces}"abc": "1"\n}`,
                expectedResult: multipleSpaces
            }
        ].forEach(({ testName, input, expectedResult }) => {
            it(testName, () => {
                expect(getIndentationCharacter(input)).toEqual(expectedResult);
            });
        });
    });

    describe('safeGet', () => {
        it('should return the correct value of existing properties', () => {
            const obj = { a: 15 };
            expect(safeGet(obj, 'a')).toBe(15);
        });

        it('should return undefined for unexisting properties', () => {
            const obj = { a: 15 };
            expect(safeGet(obj, 'random')).toBeUndefined();
        });

        it('should return undefined when the first argument is undefined', () => {
            let obj;
            expect(safeGet(obj, 'random')).toBeUndefined();
        });

        it('should return undefined when the first argument is not an object and does not have inherited property with the queried name', () => {
            const num = 15;
            expect(safeGet(num, 'random')).toBeUndefined();
        });
    });

    describe('writePackageJson', () => {
        const mockFileSystemApi = () => {
            const data = {
                isWriteFileSyncCalled: false
            };

            fs.readFileSync = (p) => {
                return JSON.stringify({ a: 1 });
            };

            fs.writeFileSync = (p, c) => {
                data.isWriteFileSyncCalled = true;
            };

            return data;
        };

        it('does not write package.json when content has not changed', () => {
            const data = mockFileSystemApi();
            writePackageJson({ a: 1 }, "projDir");
            expect(data.isWriteFileSyncCalled).toBe(false);
        });

        it('writes content, when the new one is different from the current one', () => {
            const data = mockFileSystemApi();
            writePackageJson({ b: 2 }, "projDir");
            expect(data.isWriteFileSyncCalled).toBe(true);
        });

        it('keeps indentation of the package.json when rewriting it', () => {
            let currentIndentSymbol = tab;
            fs.readFileSync = (p) => {
                return JSON.stringify({ a: 1 }, null, currentIndentSymbol);
            };

            let writtenContent = null;
            fs.writeFileSync = (p, c) => {
                writtenContent = c;
            };

            // Ensure tab indentation is persisted
            writePackageJson({ b: 2 }, "projDir");
            expect(writtenContent).toBe(`{\n${tab}"b": 2\n}`);

            // Ensure spaces indentation is persisted
            currentIndentSymbol = multipleSpaces;
            writePackageJson({ b: 2 }, "projDir");
            expect(writtenContent).toBe(`{\n${multipleSpaces}"b": 2\n}`);
        });
    });
});
