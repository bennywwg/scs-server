import express = require('express')
const fs = require('fs')
const util = require('./util.ts')

const app = express();
const port = 8222;

app.post('/', express.json(), (req: express.Request, res: express.Response) => {
    let prom: Promise<Buffer>;

    if (!req.body) {
        res
        .status(400)
        .send('No request body given');
        return;
    }

    let source: string, language: string, stage: string;
    try {
        ({
            source,
            language,
            stage
        } = req.body);
    } catch (param_err: any) {
        res
        .status(400)
        .contentType('text/plain')
        .send(param_err);
        return;
    }

    try {
        prom = util.CompilerUtil.compileProm(source, language, stage);
    } catch (compile_err: any) {
        res
        .status(400)
        .contentType('text/plain')
        .send(compile_err.toString());
        return;
    }

    prom.then((binary: Buffer) => {
        res
        .status(200)
        .send(binary);
    })
        .catch((err: string) => {
            res
            .status(400)
            .contentType('text/plain')
            .send(err);
        });
});

app.listen(port);