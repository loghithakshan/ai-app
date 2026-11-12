const path = require('path');
const fs = require('fs');

let winston;
try {
  winston = require('winston');
} catch {
  winston = null;
}

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

let logger;

if (winston) {
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level}]: ${message}`)
        )
      }),
      new winston.transports.File({ filename: path.join(logDir, 'execution.log') })
    ]
  });
} else {
  // Built-in fallback logger if winston package is omitted or unavailable
  const writeLog = (level, msg) => {
    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const line = `[${ts}] [${level.toUpperCase()}]: ${msg}`;
    console.log(line);
    try {
      fs.appendFileSync(path.join(logDir, 'execution.log'), line + '\n');
    } catch {}
  };

  logger = {
    info: (msg) => writeLog('info', msg),
    warn: (msg) => writeLog('warn', msg),
    error: (msg) => writeLog('error', msg),
    debug: (msg) => writeLog('debug', msg)
  };
}

module.exports = logger;
