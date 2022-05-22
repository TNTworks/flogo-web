import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { EOL } from 'os';

const HELP = `
      Parse a flogo web engine log and show it to console

      Usage:
        parse-log [--source 'path/to/log] [--write write/to/file.log]

      Parameters:
          --source - the location of the log file to parse (default is the engine log)
          --write - write to a file instead of console

      Example:
        parse-log
        parse-log --source=dist/local/logs/app.log
        parse-log --write=my-file.log
    `;

const DEFAULT_LOG_LOCATION = path.join('dist', 'local', 'logs', 'engine.log');

let { logPath, writeToFile } = resolveParams();
console.log(`Will read ${logPath}`);
read(logPath, writeToFile);

function read(logPath, writeToFile) {
  let write = msg => console.log(msg);
  let close = () => {};
  if (writeToFile) {
    let writeStream = fs.createWriteStream(writeToFile);
    write = msg => {
      writeStream.write(msg);
      writeStream.write(EOL);
    };
    close = () => writeStream.close();
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(logPath),
      console: false,
    });

    rl.on('line', function(line) {
      try {
        const json = JSON.parse(line);
        write(json.message);
      } catch (e) {}
    });

    rl.on('end', function() {
      close();
      resolve();
    });

    rl.on('error', function(err) {
      close();
      reject(err);
    });
  });
}

function resolveParams() {
  let logPath = DEFAULT_LOG_LOCATION;
  let writeToFile = null;

  const args = process.argv.slice(2);
  if (args[0] === '--help') {
    console.log(HELP);
    process.exit(0);
    return;
  }

  let more = true;
  let arg = null;
  while (more) {
    arg = args.shift();
    if (arg === '--source') {
      logPath = args.shift();
    } else if (arg === '--write') {
      writeToFile = args.shift();
    }
    more = args.length > 0;
  }

  return {
    logPath,
    writeToFile,
  };
}
