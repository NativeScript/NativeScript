
export const setImageName = (suite: string, spec: string, testsName: string) => {
    const testName = `${suite}-${spec}-${testsName.replace(suite, "").replace(spec, "")}`.replace(/(\-+)/ig, "-").replace(/(\_+)/ig, "_");

    return testName;
};