const express = require('express')
const fs = require('fs')
const util = require('./util.ts')

let contents = fs.readFileSync('./test.vert');

const app = express();
const port = 8222;

app.get('/', (req: any, res: any) => {
  let prom: Promise<Buffer>;
  try {
    const { source, language, stage } = req.body;
    prom = util.compileProm(source, language, stage);
  } catch (param_err: any) {
    res
    .status(400)
    .contentType('text/plain')
    .send(param_err.toString());
    return;
  }
  
  prom.then((binary: Buffer) => {
    console.log(binary);
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