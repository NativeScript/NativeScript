const { resolve } = require('path');
const fs = require('fs');

const parseWorkspaceConfig = function(platform, envConfigs, projectName, debug) {
  if (debug) {
    console.log('-- config DEBUG ---');
    console.log('platform:', platform);
    console.log('configuration:', envConfigs);
  }
  // configuration file replacements
  const fileReplacements = {};
  // anything other than .ts files should be added as part of copy plugin
  const copyReplacements = [];
  if (hasConfigurations(envConfigs)) {
    envConfigs = envConfigs.split(',').map(e => e.trim());

    const configData = findConfig(__dirname);
    const rootPath = configData.rootPath;
    const workspaceConfig = configData.workspaceConfig;

    if (workspaceConfig && projectName) {
      const projectSettings = workspaceConfig.projects[projectName];
      if (projectSettings) {
        var targetProp = 'architect';
        if (!projectSettings.architect) {
          targetProp = 'targets'; // Nx
        }
        // default project configurations
        for (const envConfig of envConfigs) {
          if (projectSettings[targetProp]) {
            if (projectSettings[targetProp].default && projectSettings[targetProp].default.configurations) {
              const defaultConfigurations = projectSettings[targetProp].default.configurations;
              if (defaultConfigurations && defaultConfigurations[envConfig]) {
                if (defaultConfigurations[envConfig].fileReplacements) {
                  for (const fileReplace of defaultConfigurations[envConfig].fileReplacements) {
                    if (debug) {
                      console.log('project fileReplacement:', fileReplace);
                    }
                    if (fileReplace.replace.indexOf('.ts') > -1) {
                      fileReplacements[resolve(__dirname, `${rootPath}${fileReplace.replace}`)] = resolve(__dirname, `${rootPath}${fileReplace.with}`);
                    } else {
                      copyReplacements.push({ from: resolve(__dirname, `${rootPath}${fileReplace.with}`), to: resolve(__dirname, `${rootPath}${fileReplace.replace}`), force: true });
                    }
                  }
                }
              }
            }
          }
        }
        // platform specific configurations (always override top level project configurations)
        for (const envConfig of envConfigs) {
          if (projectSettings[targetProp]) {
            if (projectSettings[targetProp] && projectSettings[targetProp][platform]) {
              const platformConfig = projectSettings[targetProp][platform].configurations;
              if (platformConfig && platformConfig[envConfig] && platformConfig[envConfig].fileReplacements) {
                for (const fileReplace of platformConfig[envConfig].fileReplacements) {
                  if (debug) {
                    console.log(`"${platform}" specific fileReplacement:`, fileReplace);
                  }
                  if (fileReplace.replace.indexOf('.ts') > -1) {
                    fileReplacements[resolve(__dirname, `${rootPath}${fileReplace.replace}`)] = resolve(__dirname, `${rootPath}${fileReplace.with}`);
                  } else {
                    copyReplacements.push({ from: resolve(__dirname, `${rootPath}${fileReplace.with}`), to: resolve(__dirname, `${rootPath}${fileReplace.replace}`), force: true });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (debug && copyReplacements.length) {
    console.log('Adding to CopyWebpackPlugin:', copyReplacements);
  }

  return {
    fileReplacements,
    copyReplacements
  };
}

const findConfig = function(projectDir, rootPath = '') {
  // support workspace.json and angular.json configurations
  const angularConfigName = 'angular.json';
  const angularConfig = resolve(projectDir, angularConfigName);
  const workspaceConfigName = 'workspace.json';
  const workspaceConfig = resolve(projectDir, workspaceConfigName);
  if (fs.existsSync(workspaceConfig)) {
    return {
      rootPath,
      workspaceConfig: require(workspaceConfig)
    };
  } else if (fs.existsSync(angularConfig)) {
    return {
      rootPath,
      workspaceConfig: require(angularConfig)
    };
  } else {
    rootPath += '../';
    return findConfig(resolve(projectDir, '..'), rootPath);
  }
}

const hasConfigurations = function(envConfigs) {
  return envConfigs && envConfigs !== 'undefined';
}

module.exports = {
  parseWorkspaceConfig,
  findConfig,
  hasConfigurations
};