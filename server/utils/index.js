const dayjs = require('dayjs')
const fs = require('fs')
const path = require('path')
const log4js = require('log4js');
const math = require('mathjs')

/**
 * 请求处理
 * @param req 
 * @param res 
 * @param nuxt 
 */
const handleRequest = (req, res, nuxt) => {
  nuxt.renderRoute(req.url, { req, res }).then(result => {
    return res.send(result.html)
  }).catch(e => {
    return res.send(e)
  })
}

/**
 * 格式化时间
 */
const transformTime = () => {
  return dayjs().format('YYYYMMDDHHmmssSSS')
}

/**
 * 判断文件夹不存在的时候创建文件夹，使用递归方式
 * @param folderpath 绝对路径
 */
const checkDirExist = (folderpath) => {
  if (fs.existsSync(folderpath)) {
    return true;
  } else {
    if (checkDirExist(path.dirname(folderpath))) {
      fs.mkdirSync(folderpath);
      return true;
    }
  }
}

/**
 * 写文件
 * @param fileBuffer 上传文件buffer
 * @param transformFilename 格式化文件名
 * @param relative_path 相对路径
 */
const writeFile = (fileBuffer, transformFilename, relative_path) => {
  return new Promise((resolve, reject) => {
    const upload_dir = path.join(__dirname, relative_path)
    checkDirExist(upload_dir)
    let writeStrem = fs.createWriteStream(path.join(upload_dir, transformFilename))
    writeStrem.write(fileBuffer)
    writeStrem.end()
    writeStrem.on('finish', async () => {
      resolve('上传文件成功')
    })
    writeStrem.on('error', (err) => {
      reject('写入文件错误')
    });
  })
}

/**
 * 删除过期文件
 * @param resolve_path 
 */
const deleteFile = (resolve_path,connection) => {
  const fileRepository = connection.getRepository("File");
  if (fs.existsSync(resolve_path)) {
    const logger = log4js.getLogger('delete');
    const files = fs.readdirSync(resolve_path)
    files.forEach(async item => {
      const name=path.basename(item, path.extname(item))
      const file=await fileRepository.findOne({where:{name}})
      const effective_time=file.end_time
      const now_time = dayjs().format('YYYYMMDDHHmmssSSS')
      if (math.compare(math.bignumber(effective_time), math.bignumber(now_time)) == -1) {
        try {
          fs.unlinkSync(path.join(resolve_path, item));
          logger.info(item)
        } catch (error) {
          logger.error(error)
        }
      }
    })
  }
}

module.exports = {
  handleRequest,
  transformTime,
  checkDirExist,
  writeFile,
  deleteFile
}
