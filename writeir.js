const adrsir = require('./');
const fs     = require('fs').promises;

let ir = new adrsir();

async function main() {
    if (process.argv.length < 3) {
        console.error('usage: ', process.argv[0], process.argv[1], 'no', 'name');
        return;
    }

    try {
        const file = await fs.readFile(process.argv[3], 'utf8');
        await ir.write(parseInt(process.argv[2]), Buffer.from(file, 'hex'));
    } catch (e) {
        console.error(e);
    }
}

main();
