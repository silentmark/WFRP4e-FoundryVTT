import fs from "fs";
import getSystemPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch';
import postcss from "rollup-plugin-postcss"
import bakedEnv from 'rollup-plugin-baked-env';

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = getSystemPath(manifest.id, manifest.compatibility.verified);

// eslint-disable-next-line jsdoc/require-returns
/**
 * Post-build plugin for Rollup
 */
function postBuildPlugin() {
  return {
    name: 'post-build-plugin',
    async buildEnd() {
      // eslint-disable-next-line no-undef
      console.log('[Rollup] Build finished. Running post-build tasks...');
      await upload();
      await reloadAll();
    }
  };
}
console.log("Bundling to " + systemPath)
export default {
    input: [`src/${manifest.id}.js`, `./style/${manifest.id}.scss`],
    output: {
        dir : systemPath,
        format: 'esm',
        sourcemap: true
    },
    watch : {
        clearScreen: false
    },
    plugins: [
        bakedEnv(),
        copy({
            targets : [
                {src : "./template.json", dest : systemPath},
                {src : "./system.json", dest : systemPath},
                {src : "./WFRP-Header.jpg", dest : systemPath},
                {src : "./static/*", dest : systemPath},
            ],
            watch: process.env.NODE_ENV == "production" ? false : ["./static/*/**", "system.json", "template.json"]
        }),
        postcss({
            extract : `${manifest.id}.css`,
            modules: false, // Set to true if you use CSS modules
            use: {
              sass: true,  // Enable SCSS processing
            }
        }),
        postBuildPlugin()
    ],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === 'EVAL') return
        warn(warning)
    }
}