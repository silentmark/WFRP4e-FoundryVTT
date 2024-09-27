import fs from "fs";

let path = "./scripts/"
let scripts = fs.readdirSync(path);
let count = 0;
let scriptObj = {};
for(let file of scripts)
{
  let script = fs.readFileSync(path + file, {encoding:"utf8"});
  scriptObj[file.split(".")[0]] = script;
  count++;
}

let scriptLoader = `export default function() 
{
    Hooks.on("init", () => 
    {
        foundry.utils.mergeObject(game.wfrp4e.config.effectScripts, ${JSON.stringify(scriptObj, null, 2)});
    });

}`

fs.writeFileSync("./loadScripts.js", scriptLoader)
console.log(`Packed ${count} scripts`);

path = "./scripts-pl/"
scripts = fs.readdirSync(path);
count = 0;
scriptObj = {};
for (let file of scripts)
{
  let script = fs.readFileSync(path + file, {encoding:"utf8"});
  scriptObj[file.split(".")[0]] = script;
  count++;
}

let plScriptLoader = `Hooks.on("init", async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    foundry.utils.mergeObject(game.wfrp4e.config.effectScripts, ${JSON.stringify(scriptObj, null, 2)});
});`

fs.writeFileSync("./load-scripts-pl.js", plScriptLoader)
console.log(`Packed ${count} scripts`);