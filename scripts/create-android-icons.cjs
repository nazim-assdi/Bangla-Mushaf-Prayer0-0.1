const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));
  const root = path.join(__dirname, '../android/app/src/main/res');

  // Legacy launcher icons for Android versions below Android 8.
  const sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
  };

  for (const [folder, size] of Object.entries(sizes)) {
    const dir = path.join(root, folder);
    fs.mkdirSync(dir, { recursive: true });
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      await sharp(svg).resize(size, size).png().toFile(path.join(dir, name));
    }
  }

  // Adaptive icons must reference a real drawable foreground. Pointing the
  // foreground back to @mipmap/ic_launcher creates a resource self-reference.
  const drawable = path.join(root, 'drawable-nodpi');
  fs.mkdirSync(drawable, { recursive: true });
  await sharp(svg).resize(432, 432).png()
    .toFile(path.join(drawable, 'ic_launcher_foreground.png'));

  const adaptiveDir = path.join(root, 'mipmap-anydpi-v26');
  fs.mkdirSync(adaptiveDir, { recursive: true });
  const adaptiveXml =
    '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">' +
    '<background android:drawable="@color/ic_launcher_background"/>' +
    '<foreground android:drawable="@drawable/ic_launcher_foreground"/>' +
    '</adaptive-icon>';

  fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher_round.xml'), adaptiveXml);

  const values = path.join(root, 'values');
  fs.mkdirSync(values, { recursive: true });
  fs.writeFileSync(
    path.join(values, 'ic_launcher_background.xml'),
    '<resources><color name="ic_launcher_background">#043D30</color></resources>'
  );

  const strings = path.join(values, 'strings.xml');
  let stringsXml = fs.existsSync(strings)
    ? fs.readFileSync(strings, 'utf8')
    : '<resources></resources>';

  if (/<string name="app_name">[\\s\\S]*?<\\/string>/.test(stringsXml)) {
    stringsXml = stringsXml.replace(
      /<string name="app_name">[\\s\\S]*?<\\/string>/,
      '<string name="app_name">Bangla Mushaf Prayer</string>'
    );
  } else {
    stringsXml = stringsXml.replace(
      '</resources>',
      '<string name="app_name">Bangla Mushaf Prayer</string></resources>'
    );
  }
  fs.writeFileSync(strings, stringsXml);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
