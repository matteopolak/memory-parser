# Memory Parser

## Requirements
* Node.js 16.0.0+
* TypeScript 4.0.0+

## Building
```console
> npm run build
```

## Usage
```console
> node index.js < "memorydump.bin" 1> by_flag.json 2> by_file.json
```

## Generate dump files
```console
> procdump.exe -accepteula -n 60 -s 1 -ma <pid>
```