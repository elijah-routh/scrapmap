const fs = require('fs');
const path = require('path');

const {
  IOSConfig,
  withAppBuildGradle,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');

const SOURCE_RELATIVE_PATH = 'assets/tiles/atlas.pmtiles';
const ASSET_FILE_NAME = 'atlas.pmtiles';
const GRADLE_MARKER = 'offline-atlas-pmtiles';

function readGradleContents(modResults) {
  return typeof modResults === 'string' ? modResults : modResults.contents;
}

function writeGradleContents(modResults, contents) {
  if (typeof modResults === 'string') {
    return contents;
  }

  return {
    ...modResults,
    contents,
  };
}

function assertAtlasExists(projectRoot) {
  const source = path.join(projectRoot, SOURCE_RELATIVE_PATH);

  if (!fs.existsSync(source)) {
    throw new Error(
      `Offline atlas not found at ${source}. MapLibre expects it as asset://${ASSET_FILE_NAME}.`,
    );
  }

  return source;
}

/**
 * `asset://atlas.pmtiles` is opened from the APK assets root. Copy the archive
 * there, and keep `.pmtiles` uncompressed so MapLibre can read byte ranges.
 */
function withAndroidPmtiles(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      if (config.modRequest.introspect) {
        return config;
      }

      const source = assertAtlasExists(config.modRequest.projectRoot);
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
      );
      const destination = path.join(assetsDir, ASSET_FILE_NAME);

      await fs.promises.mkdir(assetsDir, { recursive: true });
      await fs.promises.copyFile(source, destination);
      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    assertAtlasExists(config.modRequest.projectRoot);

    let contents = readGradleContents(config.modResults);

    if (!contents.includes(GRADLE_MARKER)) {
      const noCompressLine = `\n        // ${GRADLE_MARKER}: allow range reads of atlas.pmtiles\n        noCompress += "pmtiles"`;

      if (/androidResources\s*\{/.test(contents)) {
        contents = contents.replace(
          /androidResources\s*\{/,
          (match) => `${match}${noCompressLine}`,
        );
      } else {
        const block = `
    androidResources {
        // ${GRADLE_MARKER}: allow range reads of atlas.pmtiles
        noCompress += "pmtiles"
    }
`;
        const updated = contents.replace(
          /android\s*\{/,
          (match) => `${match}${block}`,
        );

        if (updated === contents) {
          throw new Error(
            'Could not find the android block in app/build.gradle while bundling atlas.pmtiles.',
          );
        }

        contents = updated;
      }
    }

    config.modResults = writeGradleContents(config.modResults, contents);
    return config;
  });

  return config;
}

/**
 * iOS `asset://` reads files from the app bundle. Copy the archive next to
 * the app sources and add it to the Resources build phase.
 */
function withIosPmtiles(config) {
  return withXcodeProject(config, async (config) => {
    const source = assertAtlasExists(config.modRequest.projectRoot);

    if (config.modRequest.introspect) {
      return config;
    }

    const sourceRoot = IOSConfig.Paths.getSourceRoot(config.modRequest.projectRoot);
    const destination = path.join(sourceRoot, ASSET_FILE_NAME);

    await fs.promises.mkdir(sourceRoot, { recursive: true });
    await fs.promises.copyFile(source, destination);

    const project = config.modResults;
    const filepath = path
      .relative(config.modRequest.platformProjectRoot, destination)
      .split(path.sep)
      .join('/');

    IOSConfig.XcodeUtils.ensureGroupRecursively(project, 'Resources');
    IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath,
      groupName: 'Resources',
      project,
      isBuildFile: true,
    });

    return config;
  });
}

/** Bundles atlas.pmtiles so the map can open pmtiles://asset://atlas.pmtiles. */
function withPmtilesAsset(config) {
  config = withAndroidPmtiles(config);
  config = withIosPmtiles(config);
  return config;
}

module.exports = withPmtilesAsset;
