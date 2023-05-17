
const express = require('express');
const openapiSchemaParser = require('..');
const router = express.Router()
const path = require('path');
const Generator = require('@asyncapi/generator');
const passport = require('passport');
const { YoutubeTranscript } = require('youtube-transcript')
module.exports = router;
const fs = require('fs');
const YoutubeMp3Downloader = require('youtube-mp3-downloader')
const ffmpeg = require('ffmpeg-static')
const ytdl = require('ytdl-core');
var vidl = require('vimeo-downloader');
const { Deepgram } = require('@deepgram/sdk')
const deepgram = new Deepgram('3a8992a62d017c85e5e435cd5a62f6f956b949e7')

router.post('/generate-file', async (req, res) => {
    try {
        const fileName = req.body.fileName;
        const video = req.body.video
        const stream = await vidl(video, { quality: '360p' })
            .pipe(fs.createWriteStream(fileName + '.mp4'));
        res.status(200).json(stream)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post('/generate-youtube-file', async (req, res) => {
    try {
        const video = req.body.video
        let allStr = ''
        await YoutubeTranscript.fetchTranscript(video)
            .then((data) => data.map((str) => allStr = allStr + `\n ${str.text}`))
            .catch((err) => res.send(error)
            );
        res.send(allStr)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post('/generate-youtube-file-deepgram', async (req, res) => {
    try {
        const videoId = req.body.video
        const YD = new YoutubeMp3Downloader({
            ffmpegPath: ffmpeg,
            outputPath: './',
            youtubeVideoQuality: 'highestaudio'
        })

        YD.download(videoId)

        YD.on('progress', data => {
            console.log(data.progress.percentage + '% downloaded')
        })

        YD.on('finished', async (err, video) => {
            const videoFileName = video.file
            console.log(`Downloaded ${videoFileName}`)

            const file = {
                buffer: fs.readFileSync(videoFileName),
                mimetype: 'audio/mp3'
            }
            const options = {
                punctuate: true,
                smart_format: true
            }

            const result = await deepgram.transcription.preRecorded(file, options).catch(e => console.log(e))
            const transcript = result.results.channels[0].alternatives[0].transcript
            fs.unlinkSync(videoFileName)
            res.send(transcript)
        })
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post('/audio-to-text', async (req, res) => {
    try {
        const audio = req.body.audio
        const file = {
            buffer: fs.readFileSync(path.join(__dirname, `./../audio/${audio}`)),
            mimetype: 'audio/mp3'
        }
        const transcription = await deepgram.transcription.preRecorded(file, {
            punctuate: true,
            paragraphs: true
        });
        const transcript = transcription.results.channels[0].alternatives[0].transcript
        res.send(transcript)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

function readFileLineByLine(filename, processline) {
    var stream = fs.createReadStream(filename);
    var s = "";
    stream.on("data", function (data) {
        s += data.toString('utf8');
        var lines = s.split("\n");
        for (var i = 0; i < lines.length - 1; i++)
            processline(lines[i]);
        s = lines[lines.length - 1];
    });

    stream.on("end", function () {
        var lines = s.split("\n");
        for (var i = 0; i < lines.length; i++)
            processline(lines[i]);
    });
}


router.post('/generate-text', async (req, res) => {

    try {
        const fileName = req.body.fileName

        const file = {
            buffer: fs.readFileSync(`./${fileName}.mp4`),
            mimetype: 'audio/mp3'
        }

        const options = {
            punctuate: false
        }

        var linenumber = 0;
        await readFileLineByLine(fs.readFileSync(`./${fileName}.mp4`), function (line) {
            console.log(++linenumber + " -- " + line);
        });
        const result = await deepgram.transcription.preRecorded(file, options).catch(e => res.send(e))
        if (result?.results?.channels[0].alternatives && result?.results?.channels[0].alternatives != '') {
            const transcript = result?.results?.channels[0].alternatives[0].transcript
            fs.unlink(`./${fileName}.mp4`, function (err) {
                if (err) return console.log(err);
                console.log('file deleted successfully');
            });
            res.send({ text: transcript })
        } else {
            res.send(`Something went wrong`)
        }
    }
    catch (error) {
        res.send(error)
    }
})


