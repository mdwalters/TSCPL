import * as fs from "node:fs";
import { options } from "./interfaces";

function callback(): void {
    return;
}

/**
* Compiles a ACPL file
*
* @param {string} file The ACPL file to compile
* @param {string} output_file_name The name of the output file
* @returns {void} Nothing
*/
export function compile(file: string, output_file_name: string, options: options): void {
    const file_split: string[] = fs.readFileSync(file, "utf-8").split("\n");
    const variables: string[] = [];
    const functions: string[] = [];
    let is_module = false;
    const imports: string[] = [];

    fs.writeFileSync(output_file_name, "");

    if (file_split[0] === "module") {
        is_module = true;
    }

    for (const i in file_split) {
        if (file_split[i].split(" ")[0] === "import") {
            const import_file: string[] = fs.readFileSync(file_split[i].split(" ")[1], "utf-8").split("\n");

            for (const j in import_file) {
                if (import_file[j].split(" ")[0] === "func") {
                    functions.push(import_file[j].split(" ")[1]);
                    imports.push(import_file[j].split(" ")[1]);
                }
            }
        }
    }

    for (const i in file_split) {
        if (file_split[i].split(" ")[0] === "outln") {
            fs.appendFile(output_file_name, `console.log(${file_split[i].split(" ").slice(1, file_split[i].split(" ").length).join(" ")});\n`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "str") {
            if (file_split[i].split(" ")[2] === undefined) {
                variables.push(file_split[i].split(" ")[1]);
                fs.appendFile(output_file_name, `let ${file_split[i].split(" ")[1]}: string;\n`, callback);
            } else {
                variables.push(file_split[i].split(" ")[1]);
                fs.appendFile(output_file_name, `let ${file_split[i].split(" ")[1]}: string = ${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(" ")};\n`, callback);
            }
            continue;
        } else if (file_split[i].split(" ")[0] === "int" || file_split[i].split(" ")[0] === "dec") {
            if (file_split[i].split(" ")[2] === undefined) {
                variables.push(file_split[i].split(" ")[1]);
                fs.appendFile(output_file_name, `let ${file_split[i].split(" ")[1]}: number;\n`, callback);
            } else {
                variables.push(file_split[i].split(" ")[1]);
                fs.appendFile(output_file_name, `let ${file_split[i].split(" ")[1]}: number = ${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(" ")};\n`, callback);
            }
            continue;
        } else if (file_split[i].split("")[0] === "#") {
            fs.appendFile(output_file_name, `//${file_split[i].split("").slice(1, file_split[i].split("").length)}`, callback);
        } else if (file_split[i].split(" ")[0] === "outs" || file_split[i].split(" ")[0] === "outi") {
            if (!variables.includes(file_split[i].split(" ")[1]) && !options.ignore_errors) {
                throw `Tried to print a undefined variable at line ${parseInt(i) + 1}`;
            }

            fs.appendFile(output_file_name, `console.log(${file_split[i].split(" ")[1]});\n`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "func") {
            functions.push(file_split[i].split(" ")[1]);

            for (const j in file_split[i].split(" ").slice(2, file_split[i].split(" ").length)) {
                variables.push(file_split[i].split(" ").slice(2, file_split[i].split(" ").length)[j]);
            }

            if (is_module) {
                if (file_split[i].split(" ")[1].startsWith("_")) {
                    fs.appendFile(output_file_name, `function ${file_split[i].split(" ")[1]}(${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(": any, ")}: any)`, callback);
                } else {
                    fs.appendFile(output_file_name, `export function ${file_split[i].split(" ")[1]}(${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(": any, ")}: any)`, callback);
                }
            } else {
                fs.appendFile(output_file_name, `function ${file_split[i].split(" ")[1]}(${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(": any, ")}: any)`, callback);
            }
            continue;
        } else if (file_split[i].split(" ")[0] === ":") {
            fs.appendFile(output_file_name, " {\n", callback);
            continue;
        } else if (file_split[i].split(" ")[0] === ";") {
            fs.appendFile(output_file_name, "}\n", callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "import") {
            compile(file_split[i].split(" ")[1], `${file_split[i].split(" ")[1].split(".acpl")[0]}.ts`, options);
            fs.appendFile(output_file_name, `import {${imports.join(", ")}} from "${file_split[i].split(" ")[1].split(".acpl")[0]}";\n`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "on") {
            const args: string[] = file_split[i].split(" ").slice(1, file_split[i].split(" ").length);

            for (const j in args) {
                if (args[j] === "=") {
                    args[j] = "==";
                } else if (args[j] === "==") {
                    args[j] = "===";
                }
            } 

            fs.appendFile(output_file_name, `if (${args.join(" ")})`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "or") {
            const args: string[] = file_split[i].split(" ").slice(1, file_split[i].split(" ").length);

            for (const j in args) {
                if (args[j] === "=") {
                    args[j] = "==";
                } else if (args[j] === "==") {
                    args[j] = "===";
                }
            } 

            fs.appendFile(output_file_name, `else if (${args.join(" ")})`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "!on") {
            fs.appendFile(output_file_name, "else", callback);
            continue;
        } else if (file_split[i].split(" ")[0] === "exit") {
            fs.appendFile(output_file_name, `process.exit(${file_split[i].split(" ")[1]});\n`, callback);
            continue;
        } else if (file_split[i] === "" || file_split[i] === "module") {
            continue;
        } else {
            if (functions.includes(file_split[i].split(" ")[0])) {
                fs.appendFile(output_file_name, `${file_split[i].split(" ")[0]}(${file_split[i].split(" ").slice(1, file_split[i].split(" ").length).join(" ")});\n`, callback);
                continue;
            } else if (variables.includes(file_split[i].split(" ")[0]) && file_split[i].split(" ")[1]) {
                fs.appendFile(output_file_name, `${file_split[i].split(" ")[0]} = ${file_split[i].split(" ")[1]};\n`, callback);
                continue;
            } else {
                if (!options.ignore_errors) throw `Invalid statement at line ${parseInt(i) + 1}`;
            }
        }
    }
}
