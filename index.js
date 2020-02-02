'use strict';

const i2c = require('i2c-bus');

// ADRSIRのアドレス
const BUS_NO            = 1;
const SLAVE_ADDRESS     = 0x52;

// ADRSIRのコマンド
const R1_MEMO_NO_WRITE  = 0x15; // bus-write(ADR,cmd,1)
const R2_DATA_NUM_READ  = 0x25; // bus-read(ADR,cmd,3)
const R3_DATA_READ      = 0x35; // bus-read(ADR,cmd,n)
const W1_MEMO_NO_WRITE  = 0x19; // bus-write(ADR,cmd,1)
const W2_DATA_NUM_WRITE = 0x29; // bus-write(ADR,cmd,3)
const W3_DATA_WRITE     = 0x39; // bus-read(ADR,cmd,n)
const W4_FLASH_WRITE    = 0x49; // bus-read(ADR,cmd,n)
const T1_TRANS_START    = 0x59; // bus-write(ADR,cmd,1)

var adrsir = function() {
};

function openI2C(no) {
    return new Promise((resolve, reject) => {
        let bus = i2c.open(no, (err) => {
            reject(err);
        });
        resolve(bus);
    });
}

function closeI2C(bus) {
    return new Promise((resolve, reject) => {
        if (bus != null) {
            bus.close((err) => {
                reject(err);
            });
        }
        resolve(true);
    });
}

function readI2C(bus, addr, cmd, buffer) {
    return new Promise((resolve, reject) => {
        bus.readI2cBlock(addr, cmd, buffer.length, buffer, (err, bytesRead, buffer) => {
            if (err) {
                reject(err);
            }
            resolve(buffer);
        });
    });
}

function writeI2C(bus, addr, cmd, buffer) {
    return new Promise((resolve, reject) => {
        bus.writeI2cBlock(addr, cmd, buffer.length, buffer, (err) => {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
}

adrsir.prototype.send = async function(buf) {
    let bus = null;
    try {
        bus = await openI2C(BUS_NO);

        let size = Buffer.alloc(2);
        size.writeUInt16BE(buf.length / 4, 0);
        await writeI2C(bus, SLAVE_ADDRESS, W2_DATA_NUM_WRITE, size);

        for (let i = 0; i < buf.length; i += 4) {
            await writeI2C(bus, SLAVE_ADDRESS, W3_DATA_WRITE, buf.slice(i, i + 4));
        }

        await writeI2C(bus, SLAVE_ADDRESS, T1_TRANS_START, Buffer.alloc(1));

        await closeI2C(bus);
    }
    catch(e) {
        await closeI2C(bus);
        throw e;
    }
};

adrsir.prototype.read = async function(no) {
    let bus = null;
    try {
        bus = await openI2C(BUS_NO);

        await writeI2C(bus, SLAVE_ADDRESS, R1_MEMO_NO_WRITE, Buffer.from([no]));

        let size = Buffer.alloc(3);
        await readI2C(bus, SLAVE_ADDRESS, R2_DATA_NUM_READ, size);
        let len = size.readUInt16BE(1);
        if (len == 0xffff) {
            return [];
        }

        await readI2C(bus, SLAVE_ADDRESS, R3_DATA_READ, Buffer.alloc(1));

        let buf = Buffer.alloc(len * 4);
        for (let i = 0; i < buf.length; i += 4) {
            await readI2C(bus, SLAVE_ADDRESS, R3_DATA_READ, buf.slice(i, i + 4));
        }

        await closeI2C(bus);

        return buf;
    }
    catch(e) {
        await closeI2C(bus);
        throw e;
    }
};

adrsir.prototype.write = async function(no, buf) {
    let bus = null;
    try {
        bus = await openI2C(BUS_NO);

        await writeI2C(bus, SLAVE_ADDRESS, W1_MEMO_NO_WRITE, Buffer.from([no]));

        let size = Buffer.alloc(2);
        size.writeUInt16BE(buf.length / 4, 0);
        await writeI2C(bus, SLAVE_ADDRESS, W2_DATA_NUM_WRITE, size);

        for (let i = 0; i < buf.length; i += 4) {
            await writeI2C(bus, SLAVE_ADDRESS, W3_DATA_WRITE, buf.slice(i, i + 4));
        }

        await writeI2C(bus, SLAVE_ADDRESS, W4_FLASH_WRITE, Buffer.alloc(1));

        return buf;
    }
    catch(e) {
        await closeI2C(bus);
        throw e;
    }
};

module.exports = adrsir;
