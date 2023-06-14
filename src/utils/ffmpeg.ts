import { FfmpegCommand } from 'fluent-ffmpeg';

export const runFfmpegCmd = (command: FfmpegCommand) =>
  new Promise<void>((resolve, reject) => {
    command
      .on('error', (error) => {
        reject(error);
      })
      .on('end', () => {
        resolve();
      })
      .run();
  });

export const runScreenShotCmd = (command: FfmpegCommand) =>
  new Promise<void>((resolve, reject) => {
    command
      .on('error', (error) => {
        reject(error);
      })
      .on('end', () => {
        resolve();
      });
  });
