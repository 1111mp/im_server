// const SnowflakeId = require('snowflake-id').default
// const { UniqueID } = require("nodejs-snowflake");

// /** 分布式唯一ID https://juejin.im/post/5b3a23746fb9a024e15cad79  https://zhuanlan.zhihu.com/p/94907712 */
// /** https://github.com/utkarsh-pro/nodejs-snowflake */
// export function getSnowflakeId() {
//   const uid = new UniqueID();
//   return uid.getUniqueID();
//   // let snowflake = new SnowflakeId({
//   //   mid: 42,
//   //   offset: (2020-1970) * 31536000 * 1000
//   // })

//   // return snowflake.generate()
// }

export function getFileUrl(files: any[]) {
  let urlArr: any[] = [];

  files.forEach((file) => {
    let path = file.path;
    let filename = path.substring(path.lastIndexOf("\\") + 1, path.length);
    urlArr.push(`http://localhost:3000/upload/${filename}`);
  });

  return urlArr;
}
