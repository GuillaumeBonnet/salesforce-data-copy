console.log('gboDebug: in forge config A');
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
      platforms: ['darwin', 'win32'],
      config: {},
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {},
    },
  ],
};

export default config;
