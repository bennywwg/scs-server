const child_process = require('child_process')
const stream = require('stream')
const { v4: uuidv4 } = require('uuid')

class CompilerUtil {
    public static execCompileProm(params: string[], input_file_name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`spawning glslangValidator ${params.join(' ')}`);

            // This fucking sucks
            const compile_process = child_process.exec(`glslangValidator ${params.join(' ')}`, []);

            let output_accum = '';
            compile_process.stdout.on('data', (data: Buffer) => {
                output_accum += data.toString();
            });
            compile_process.stderr.on('data', (data: Buffer) => {
                output_accum += data.toString();
            });

            // TODO: Add proper timeouts
            compile_process.on('close', () => {
                if (output_accum.trim() !== input_file_name) {
                    console.log(`${input_file_name} failed to compile`);
                    reject(output_accum);
                } else {
                    console.log(`${input_file_name} compiled successfully`);
                    resolve(input_file_name);
                }
            });
        });
    };

    public static compileProm = function(source: string, language: string, stage: string): Promise<string|Buffer> {
        if (!source) {
            throw new Error('A program source is required');
        }

        if (language !== 'glsl' && language !== 'hlsl') {
            throw new Error('Language must be either glsl or hlsl');
        }

        const valid_stages = ['vert', 'tesc', 'tese', 'geom', 'frag', 'comp'];
        if (!valid_stages.includes(stage)) {
            throw new Error('Stage must be either vert, tesc, tese, geom, frag, or comp');
        }

        // Create the temporary filename. glslangValidator is just terrible and the -S flag
        // should control the stage, but it doesn't
        const input_file_name = uuidv4() + `.${stage}`;
        const output_file_name = uuidv4();

        let compiler_params = [
            '-V',                               // Create Vulkan SPIR-V binary
            `-o ${output_file_name}`,           // Output to the temporary file
            (language === 'hlsl') ? '-D' : '',  // If language is hlsl, add specify it with the -D flag
            `${input_file_name}`,               // (ugh) Input from file, because stdin refuses to work
        ];

        // TODO: Add proper timeouts
        return new Promise((resolve, reject) => {
            fs.writeFile(input_file_name, source + '\n', (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    CompilerUtil.execCompileProm(compiler_params, input_file_name)
                    .then(val => {
                        const readStream = fs.createReadStream(output_file_name);
                        let buf = Buffer.alloc(0,0);
                        readStream.on('data', (chunk: Buffer) => {
                            buf = Buffer.concat([buf, chunk]);
                        });
                        readStream.on('close', () => {
                            resolve(buf);
                            fs.unlink(output_file_name, () => {});
                        });
                        
                    })
                    .catch(err => reject(err))
                    .finally(() => {
                        fs.unlink(input_file_name, () => {});
                    })
                }
            });
        });
    }
}