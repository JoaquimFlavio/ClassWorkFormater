const fs = require('fs');
const Jimp = require('jimp');
const Pdfkit = require('pdfkit');

const doc = new Pdfkit()

//Pipe its output somewhere, like to a file or HTTP response 
//See below for browser usage 
doc.pipe(fs.createWriteStream('output.pdf'))

function readFiles(dirname, resolve, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    resolve(filenames);
  });
}

var executed = 0;
var imageList = [];

new Promise((resolve, reject) => {
  readFiles(
    './files', 
    files => resolve(files),
    err => reject(err)
  )
}).then(fileNames => {
  fileNames.filter(elm => elm != '.DS_Store').map((fileName, index) => {
    Jimp.read(`./files/${fileName}`).then(image => {
      Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
        image
        .brightness(-0.28)
        .contrast(0.6)
        .threshold({ max: 255 })
        // .print(font, 500, 10, 'Joaquim Flavio A Q Gomes')
        .writeAsync(`./result/${fileName}`)
        .then(() => {
          const imgagename = `./result/${fileName}`
          imageList.push(imgagename);
          
          if(++executed >= fileNames.length-1) {
            imageList
            .sort((a, b) => {
              if(a < b) return -1
              if(a > b) return 1
              return 0;
            })
            .forEach((fileName, index) => {
              if(index == 0) {
                doc.image(fileName, {
                  scale: 0.5,
                  align: 'center',
                  valign: 'center',
                });
              } else {
                doc.addPage()
                .image(fileName, {
                  scale: 0.5,
                  align: 'center',
                  valign: 'center',
                });
              }

              if(index >= imageList.length-1) doc.end()
            })
          }
          // console.log(executed, (fileNames.length))
        })
      });
    }).then(() => {
      
    })
  })
})
