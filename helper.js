import fs from 'fs';

const readFile = (path, opts = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

const writeFile = (path, data, opts = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
const beginVideos = async () => {
    if(fs.existsSync('./database.json') === false){
        fs.writeFileSync('./database.json',JSON.stringify({videos:[]}));
    }
    let result = await readFile('./database.json');
    return JSON.parse(result).videos;
    }
const endVideos =  async (videos) => {
        await writeFile('./database.json',JSON.stringify({videos}));
    }
export {beginVideos,endVideos}