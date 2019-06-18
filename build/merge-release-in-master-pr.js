const { createPR, gitBranch } = require("./pr-helper");

const postQuery = {
    "head": gitBranch,
    "base": "master",
    "title": "chore: merge release in master"
}

createPR(postQuery);