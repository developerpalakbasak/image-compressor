const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const projectDir = process.cwd();
const androidDir = path.join(projectDir, 'android');
const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
const proguardRulesPath = path.join(androidDir, 'app', 'proguard-rules.pro');
const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const fileName = 'app-arm64-v8a-release.apk';
const sourcePath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', fileName);
const destPath = path.join(projectDir, fileName);

try {
    console.log('🚀 Starting Build Process...');

    // 1. Remove existing android directory and Run Expo Prebuild
    if (fs.existsSync(androidDir)) {
        console.log('🗑️ Removing existing android directory...');
        fs.rmSync(androidDir, { recursive: true, force: true });
    }

    console.log('🔨 Running Expo Prebuild...');
    execSync('npx expo prebuild --platform android --no-install', { stdio: 'inherit' });

    // 2. Modify android/gradle.properties
    if (fs.existsSync(gradlePropertiesPath)) {
        console.log('📝 Modifying gradle.properties...');
        let content = fs.readFileSync(gradlePropertiesPath, 'utf8');
        content = content.replace(/reactNativeArchitectures=.*/, 'reactNativeArchitectures=arm64-v8a');
        fs.writeFileSync(gradlePropertiesPath, content);
    }

    // 3. Modify android/app/proguard-rules.pro
    if (fs.existsSync(proguardRulesPath)) {
        console.log('📝 Modifying proguard-rules.pro...');
        const extraRules = `
# Expo modules fix for R8
-keep class expo.modules.** { *; }
-keep class kotlin.reflect.jvm.internal.** { *; }
-dontwarn expo.modules.**
-dontwarn kotlin.reflect.jvm.internal.**
`;
        fs.appendFileSync(proguardRulesPath, extraRules);
    }

    // 4. Modify android/app/build.gradle
    if (fs.existsSync(buildGradlePath)) {
        console.log('📝 Modifying build.gradle...');
        let content = fs.readFileSync(buildGradlePath, 'utf8');

        // Add splits block inside android {}
        if (!content.includes('splits {')) {
            const splitsBlock = `
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a"
            universalApk false
        }
    }\n`;
            content = content.replace(/android \{/, `android {${splitsBlock}`);
        }

        // Update release block optimization
        content = content.replace(/shrinkResources .*/, 'shrinkResources true');
        content = content.replace(/minifyEnabled .*/, 'minifyEnabled true');
        content = content.replace(/crunchPngs .*/, 'crunchPngs true');

        // Use optimized proguard file
        content = content.replace(/proguard-android\.txt/, 'proguard-android-optimize.txt');

        // Also ensure these variables are not used if they override the above
        content = content.replace(/def enableShrinkResources = .*/, 'def enableShrinkResources = "true"');
        content = content.replace(/def enableMinifyInReleaseBuilds = .*/, 'def enableMinifyInReleaseBuilds = true');

        fs.writeFileSync(buildGradlePath, content);
        console.log('✅ build.gradle modified.');
    } else {
        throw new Error(`Could not find build.gradle at ${buildGradlePath}`);
    }

    // 5. Clean the project
    console.log('🧹 Running clean...');
    execSync(`${gradlewCmd} clean`, { cwd: androidDir, stdio: 'inherit' });

    // 6. Build the release APK
    console.log('📦 Building Release APK...');
    execSync(`${gradlewCmd} assembleRelease`, { cwd: androidDir, stdio: 'inherit' });

    // 7. Move the file
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Success! APK moved to: ${destPath}`);
    } else {
        console.error('❌ Build complete, but APK file not found at:', sourcePath);
        process.exit(1);
    }

} catch (error) {
    console.error('\n❌ Build failed during execution.');
    console.error('Error details:', error.message);
    if (error.stderr) {
        console.error('Stderr:', error.stderr.toString());
    }
    process.exit(1);
}