import * as ffmpeg from 'fluent-ffmpeg';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { ensureDirSync } from 'fs-extra';

ensureDirSync('./upload');

// ffmpeg('./mountain.jpg')
//   .size('20x?')
//   .output('./mountain-small.jpg')
//   .on('error', (err) => {
//     console.log('err');
//     console.log(err);
//   })
//   .run();
