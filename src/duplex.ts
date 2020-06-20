import { Readable, Writable, Duplex } from "stream";
import util from "util";

// Inherit of Duplex stream
util.inherits(Plexer, Duplex);

interface DuplexerParams {
  options?: { objectMode: boolean; reemitErrors: boolean };
  writableStream: Writable;
  readableStream: Readable;
}

function Plexer({ options = { objectMode: false, reemitErrors: true }, writableStream, readableStream }: DuplexerParams): Duplex {
  const { objectMode, reemitErrors } = options;
  readableStream = new Readable({ objectMode }).wrap(readableStream);

  const instance = new Duplex({
    readableObjectMode: objectMode,
    writableObjectMode: objectMode,
    write(chunk, encoding, callback) {
      writableStream.write(chunk, encoding, callback);
    },
    read(size) {
      readableStream.read(size);
    },
  });

  if (reemitErrors) {
    writableStream.on("error", (err) => {
      instance.emit("error", err);
    });
    readableStream.on("error", (err) => {
      instance.emit("error", err);
    });
  }

  writableStream.on("drain", () => {
    instance.emit("drain");
  });

  instance.once("finish", () => {
    writableStream.end();
  });

  writableStream.once("finish", () => {
    instance.end();
  });

  readableStream.on("readable", () => {
    let data;
    while ((data = readableStream.read())) {
      instance.push(data);
    }
  });

  readableStream.once("end", () => {
    instance.push(null);
  });

  return instance;
}

Plexer.obj = function (writableStream: Writable, readableStream: Readable) {
  const options = { objectMode: true, reemitErrors: true };
  return Plexer.apply({}, [{ options, writableStream, readableStream }]);
};

export = Plexer;
