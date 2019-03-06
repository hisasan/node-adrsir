const adrsir = require('./adrsir');
const fs     = require('fs').promises;

let ir = new adrsir();

async function main() {
    if (process.argv.length < 3) {
        console.error('usage: ', process.argv[0], process.argv[1], 'name');
        return;
    }

    try {
        const file = await fs.readFile(process.argv[2], 'utf8');
        await ir.send(Buffer.from(file, 'hex'));
    } catch (e) {
        console.error(e);
    }
}

main();
