class RandomBytesBuffer {
  private bytes: Uint8Array<ArrayBuffer>

  constructor(size: number) {
    this.bytes = new Uint8Array(new ArrayBuffer(size))
    globalThis.crypto.getRandomValues(this.bytes)
  }

  readInt32LE(offset = 0) {
    return new DataView(
      this.bytes.buffer,
      this.bytes.byteOffset,
      this.bytes.byteLength
    ).getInt32(offset, true)
  }
}

export function randomBytes(size: number) {
  return new RandomBytesBuffer(size)
}
