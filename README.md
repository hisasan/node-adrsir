# node-adrsir

ラズパイの小亀ボードである、ビット・トレード・ワン社製のADRSIRボードで赤外線リモコンの学習、送信を行うためのモジュールです。

## 使用方法

### 初期化
```JavaScript
const adrsir_factory = require('node-adrsir');
const ir = new adrsir_factory();
```
I2Cのバスなんかは決め打ちなので、必要に応じて書き換えてください。

### 赤外線データ読み出し

ADRSIRボード内に記録した赤外線データを読み出します。
```JavaScript
async function read() {
    const no  = 1; // 記録番号（赤外線を記録したADRSIRのボタン番号）
    const buf = await ir.read(no);
    console.log(buf.toString('hex'));
}
```

### 赤外線送信

ADRSIRボードから赤外線データを送信します。
```JavaScript
async function send(file) {
    const fs   = require('fs').promises;
    const file = await fs.readFile(file, 'utf8');
    await ir.send(Buffer.from(file, 'hex'));
}
```

### サポートコマンド

|コマンド|内容|
|:----|:--------------------------------------|
|readir.js|node readir.js no 指定番号の赤外線データを読み出して表示|
|sendir.js|node sendir.js file 指定ファイルの赤外線データを送信、ファイルの中身はreadir.jsで表示したそのまま|

## 使用環境

以下のような環境で使用しています。

|項目|内容|
|:----|:--------------------------------------|
|ホスト|Raspberry Pi 3B+ Raspbian Stretch Lite|
