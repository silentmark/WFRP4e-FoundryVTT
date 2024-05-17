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
        mergeObject(game.wfrp4e.config.effectScripts, ${JSON.stringify(scriptObj, null, 4)});
    });

}`

fs.writeFileSync("./loadScripts.js", scriptLoader)
console.log(`Packed ${count} scripts`);
/*
path = "./scripts-pl/"
scripts = fs.readdirSync(path);
count = 0;
scriptObj = {};
for(let file of scripts)
{
  let script = fs.readFileSync(path + file, {encoding:"utf8"});
  scriptObj[file.split(".")[0]] = script;
  count++;
}

scriptLoader = `Hooks.on("init", () => {
    mergeObject(game.wfrp4e.config.effectScripts, ${JSON.stringify(scriptObj, null, 4)});
});`

fs.writeFileSync("./load-scripts-pl.js", scriptLoader)
*/