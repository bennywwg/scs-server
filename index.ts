const express = require('express')
const fs = require('fs')
const util = require('./util.ts')

let contents = fs.readFileSync('./test.vert');

const app = express();
const port = 8222;

const USE_CACHE_DEFAULT = true;

app.get('/', (req: any, res: any) => {
  let prom: Promise<Buffer>;

  if (req.body) {
    res
    .status(400)
    .contentType('text/plain')
    .send('No request body given');
    return;
  }

  let source: string, language: string, stage: string;
  let use_cache: boolean = USE_CACHE_DEFAULT;
  try {
    ({
      source,
      language,
      stage,
      use_cache
    } = req.body);
  } catch (param_err: any) {
    res
    .status(400)
    .contentType('text/plain')
    .send(param_err);
    return;
  }

  try {
    prom = util.compileProm(source, language, stage);
  } catch (compile_err: any) {
    res
    .status(400)
    .contentType('text/plain')
    .send(compile_err.toString());
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