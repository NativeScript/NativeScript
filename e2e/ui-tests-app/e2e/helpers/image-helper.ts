
export const setImageName = (suite: string, spec: string, testsName: string) => {
    let testName = testsName
        .replace(suite, "")
        .replace(spec, "");
    testName = `${suite}-${spec}-${testName}`
        .replace("should", "-")
        .replace(/\s+/g, "-")
        .replace(/\_+/ig, "_")
        .replace(/[!$%^&*()+|~=`{}\[\]:";'<>?,.\/]/g, "")
        .replace(/\-+/g, "-");

    return testName;
};
