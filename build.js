const electronInstaller = require('electron-winstaller');

async function build() {
    try {
        await electronInstaller.createWindowsInstaller({
          appDirectory: './build',
          description:"Echo Arena Streaming Tool",
          outputDirectory: '../installerOutput',
          authors: 'NotBlue, Kwizer, Moozor',
          exe: 'EAST.exe',
          version:"0.0.3",
          iconUrl:"../minimap_disc.png"
        });
        console.log('It worked!');
      } catch (e) {
        console.log(`No dice: ${e.message}`);
    }
}

build()