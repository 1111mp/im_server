const path = require('path')
const fs = require('fs-extra')
const router = require('koa-router')()
const { uploadPath } = require('../config')
const { getFileUrl } = require('../config')

router.prefix('/upload')

router.post('/', async (ctx, next) => {
  /** 上传成功之后的files对象 */
  let { files } = ctx.request.files
  let urlArr: any[] = getFileUrl(files)
  ctx.body = {
    code: 200,
    data: urlArr
  }
})

const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

/**
 * @description: 分片上传 https://www.cnblogs.com/tugenhua0707/p/11246860.html
 * @param {merge|upload} type 请求的类型
 * @return: 
 */
router.post('/chunkFile', async (ctx, next) => {
  const { type } = ctx.request.body

  if (type === 'merge') {

    try {
      const { index, hash, total, name } = ctx.request.body
      const chunksPath = path.join(uploadPath, hash, '/')
      const filePath = path.join(uploadPath, name)

      // 读取所有的chunks 文件名存放在数组中
      const chunks = fs.readdirSync(chunksPath)
      // 创建存储文件
      fs.writeFileSync(filePath, '')

      if (chunks.length !== total || chunks.length === 0) {
        ctx.body = {
          code: 400,
          msg: '切片文件数量不符合'
        }
        return false
      }

      for (let i = 0; i < total; i++) {
        // 追加写入到文件中
        fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + '-' + i));
        // 删除本次使用的chunk    
        fs.unlinkSync(chunksPath + hash + '-' + i);
      }

      fs.rmdirSync(chunksPath)

      // 文件合并成功，可以把文件信息进行入库
      ctx.body = {
        code: 200,
        msg: 'successed',
        data: `http://localhost:3000/upload/${name}`
      }
    } catch (err) {
      ctx.body = {
        code: 400,
        msg: 'merge error'
      }
    }

  } else if (type === 'upload') {

    const { index, hash } = ctx.request.body

    try {
      const { file } = ctx.request.files
      const chunksPath = path.join(uploadPath, hash, '/')

      if (!fs.existsSync(path.join(uploadPath, hash, '/', hash + '-' + index))) {
        if (!fs.existsSync(chunksPath)) mkdirsSync(chunksPath)

        fs.renameSync(file.path, chunksPath + hash + '-' + index)
      }

      ctx.body = {
        code: 200,
        msg: 'successed'
      }
    } catch (err) {
      ctx.body = {
        code: 400,
        msg: `hash: ${hash} index: ${index} upload error`
      }
    }

  } else {
    ctx.body = {
      code: 400,
      msg: 'unkown type'
    }
  }
})

module.exports = router

export { }

/** 大文件分片上传的前端使用代码 */
/**
 * import React from 'react';
import '@/App.styl';
import axios from 'axios'
import SparkMD5 from 'spark-md5'

const chunkSize = 2 * 1024 * 1024; // 每个chunk的大小，设置为2兆
const blobSlice = File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice;

// 获取文件的MD5
function getFileMDfive(file: any) {
  return new Promise((resolve, reject) => {
    let fileReader = new FileReader(),
      // blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
      // chunkSize = MAXSIZE * 1024 * 1024,
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5()

    let loadNext = () => {
      let start = currentChunk * chunkSize,
        end = start + chunkSize >= file.size ? file.size : start + chunkSize

      fileReader.readAsBinaryString(blobSlice.call(file, start, end))
    }

    fileReader.onload = (e: any) => {
      console.log("read chunk nr", currentChunk + 1, "of", chunks)
      spark.appendBinary(e.target.result) // append binary string
      currentChunk++

      if (currentChunk < chunks) {
        loadNext()
      }
      else {
        console.log("finished loading")
        resolve(spark.end())
      }
    }
    loadNext()
  })
}

export default class App extends React.Component {

  clickHandle = () => {
    this.refs.file && (this.refs.file as any).click()
  }

  upload = async (evt: any) => {
    let file = evt.target.files[0]

    const blockCount = Math.ceil(file.size / chunkSize); // 分片总数
    const axiosPromiseArray = []; // axiosPromise数组
    const hash = await getFileMDfive(file); //文件 hash

    // 获取文件hash之后，如果需要做断点续传，可以根据hash值去后台进行校验。
    // 看看是否已经上传过该文件，并且是否已经传送完成以及已经上传的切片。

    for (let i = 0; i < blockCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      // 构建表单
      const form = new FormData();
      form.append('file', blobSlice.call(file, start, end));
      form.append('name', file.name);
      // @ts-ignore
      form.append('total', blockCount);
      // @ts-ignore
      form.append('index', i);
      form.append('size', file.size);
      // @ts-ignore
      form.append('hash', hash);
      form.append('type', 'upload');
      // ajax提交 分片，此时 content-type 为 multipart/form-data
      const axiosOptions = {
        onUploadProgress: (e: any) => {
          // 处理上传的进度
          console.log(blockCount, i, e, file);
        },
      };
      // 加入到 Promise 数组中
      axiosPromiseArray.push(axios.post('/upload/chunkFile', form, axiosOptions));
    }

    // 所有分片上传后，请求合并分片文件
    await axios.all(axiosPromiseArray).then(() => {
      // 合并chunks
      const data = {
        size: file.size,
        name: file.name,
        total: blockCount,
        hash,
        type: 'merge'
      };
      axios.post('/upload/chunkFile', data).then(res => {
        console.log('上传成功');
        console.log(res.data, file);
        alert('上传成功');
      }).catch(err => {
        console.log(err);
      });
    });

  }

  render() {
    return (
      <div style={{ textAlign: 'center', marginTop: '150px' }}>
        测试 大文件分片上传
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <input
          ref="file"
          type="file"
          name="avatar"
          style={{ display: 'none' }}
          onChange={(e: any) => this.upload(e)}
        />
        <button onClick={this.clickHandle}>开始上传</button>
      </div>
    )
  }
}
 *
 */
