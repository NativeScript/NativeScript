const { execSync } = require('child_process');
const { writeFileSync, unlinkSync } = require("fs");
const { resolve } = require("path");

exports.gitBranch = execSync("git branch").toString()
    .split("\n")
    .filter(f => f.trim().startsWith("*"))[0]
    .replace("*", "").trim();

exports.createPR = (postQuery) => {
    if (!process.env.GIT_TOKEN) {
        console.error("Missing env variable GIT_TOKEN");
        process.exit(1);
    }
    const releaseDataJsonPath = resolve(process.cwd(), "git-helper.json");
    writeFileSync(releaseDataJsonPath, JSON.stringify(postQuery));
    const result = execSync(` curl -d "@${releaseDataJsonPath}" -X POST https://api.github.com/repos/NativeScript/NativeScript/pulls -H "Authorization: token ${process.env.GIT_TOKEN}" `);
    console.log(result.toString());
    unlinkSync(releaseDataJsonPath);

    const requesResultJson = JSON.parse(result);
    execSync(`open ${requesResultJson.html_url}`);

    return requesResultJson;
}

exports.argsParser = () => {
    args = {};
    process.argv
        .filter(a => a.startsWith("--"))
        .map(el => {
            el = el.split("=");
            const prop = el[0].replace("--", "").replace("-", "").trim();
            const value = el[1].trim();
            args[prop] = value;
        });

    return args;
}