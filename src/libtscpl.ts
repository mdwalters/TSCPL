import * as fs from "fs";

function callback(): void {
    return;
}

/**
* Compiles a ACPL file
*
* @param file The ACPL file to compile
* @param output_file_name The name of the output file
*/
export function compile(file: string, output_file_name: string): void {
    let file_split: string[] = fs.readFileSync(file, "utf-8").split("\n");

    let variables: string[] = [];
    let functions: string[] = [];

    fs.writeFileSync(output_file_name, "");

    for (let i in file_split) {
        if (file_split[i].split(" ")[0] === "in") {
            fs.appendFile(output_file_name, `import readline from "readline";
const prompt = readline.createInterface({ 
    input: process.stdin,
    output: process.stdout
});\n`, callback);
            break;
        }
    }

    for (let i in file_split) {
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
            continue;
        } else if (file_split[i].split(" ")[0] === "outs" || file_split[i].split(" ")[0] === "outi") {
            if (!(variables.includes(file_split[i].split(" ")[1]))) {
                throw `Tried to print a undefined variable at line ${parseInt(i) + 1}`;
            }

            fs.appendFile(output_file_name, `console.log(${file_split[i].split(" ")[1]});\n`, callback);
            continue;
        } else if (file_split[i] === "") {
            continue;
        } else if (file_split[i].split(" ")[0] === "func") {
            functions.push(file_split[i].split(" ")[1]);

            for (let i in file_split[i].split(" ").slice(2, file_split[i].split(" ").length)) {
                variables.push(file_split[i].split(" ").slice(2, file_split[i].split(" ").length)[i]);
            }

            fs.appendFile(output_file_name, `function ${file_split[i].split(" ")[1]}(${file_split[i].split(" ").slice(2, file_split[i].split(" ").length).join(", ")})`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === ":") {
            fs.appendFile(output_file_name, ` {\n`, callback);
            continue;
        } else if (file_split[i].split(" ")[0] === ";") {
            fs.appendFile(output_file_name, `}\n`, callback);
            continue;
        } else {
            if (functions.includes(file_split[i].split(" ")[0])) {
                fs.appendFile(output_file_name, `${file_split[i].split(" ")[0]}(${file_split[i].split(" ").slice(1, file_split[i].split(" ").length).join(", ")});\n`, callback);
                continue;
            } else if (variables.includes(file_split[i].split(" ")[0])) {
                continue;
            } else {
                throw `Invalid statement at line ${parseInt(i) + 1}`;
            }
        }
    }
}