import pino from 'pino';
import fs from 'fs';

const streams = [
    { stream: process.stdout }, // Muestra en consola
    { stream: fs.createWriteStream('app.log') } // Guarda en archivo
  ];
  
export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
},
pino.multistream(streams)
);
