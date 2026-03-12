const { getJestProjectsAsync } = require('@nx/jest');

export default async () => ({ projects: await getJestProjectsAsync() });
