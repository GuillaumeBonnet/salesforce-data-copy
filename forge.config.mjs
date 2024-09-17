const config = {
  packagerConfig: {
    asar: true,
    osxSign: {},
    ignore: ['coverage', '.vscode', '.quasar'],
    // prebuiltAsar: '/dist/electron/UnPackaged',
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        authors: 'Electron contributors',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
      config: {},
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'GuillaumeBonnet',
          name: 'salesforce-data-copy',
        },
        prerelease: true,
      },
    },
  ],
};

export default config;
