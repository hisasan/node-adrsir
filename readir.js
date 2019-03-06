const adrsir = require('./adrsir');

let ir = new adrsir();

async function main() {
    if (process.argv.length < 3) {
        console.error('usage: ', process.argv[0], process.argv[1], 'memo_no');
        return;
    }

    try {
        let buf = await ir.read(parseInt(process.argv[2]));
        console.log(buf.toString('hex'));
    } catch (e) {
        console.error(e);
    }
}

main();
