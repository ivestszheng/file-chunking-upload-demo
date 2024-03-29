// @ts-nocheck
/*
 * @Descripttion: 
 * @Date: 2022-06-28 21:55:20
 * @LastEditTime: 2022-07-06 16:35:14
 */
const express = require('express');
const bodyParser = require('body-parser');
const uploader = require('express-fileupload');
const { extname, resolve } = require('path')
const { existsSync, appendFileSync, writeFileSync } = require('fs')
const PORT = 8000

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(uploader())
app.use('/', express.static('upload_temp'))

const ALLOWED_TYPE = {
    'video/mp4': 'mp4',
    'video/ogg': 'ogg',
}

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methodes', 'POST,GET')
    // 设置要暴露的请求头
    // res.header('Access-Control-Expose-Headers','Date,ETag,X-Powered-By,Keep-Alive')
    next()
})

app.post('/upload_video', (req, res) => {
    const { name, type, size, fileName, uploadedSize } = req.body

    const file = req?.files?.file

    if (!file) {
        res.send({
            code: 1001,
            msg: 'No file uploaded'
        })
        return
    }

    if (!ALLOWED_TYPE[type]) {
        res.send({
            code: 1002,
            msg: 'The type is not allowed for uploading.'
        })
        return
    }

    const filename = fileName + extname(name)
    const filePath = resolve(__dirname, './upload_temp/' + filename)

    if (uploadedSize !== '0') {
        if (!existsSync(filePath)) {
            res.send({
                code: 1003,
                msg: 'No file exists.'
            })
            return
        }

        appendFileSync(filePath, file.data)

        res.send({
            code: 0,
            msg: 'Appended',
            video_url: 'http://localhost:8000/' + filename
        })

        return
    }

    writeFileSync(filePath, file.data)

    res.send({
        code: 0,
        msg: 'File is created'
    })
})


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
