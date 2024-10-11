interface DnsPacket {
  transactionId: number;
  flags: BigInt;
  questions: BigInt;
}

export function parseDnsPackets(msg: Buffer): DnsPacket {
  const fields = msg.readUInt16BE();
  return {
    transactionId: msg.readUint16BE(0),
    flags: msg.readBigInt64BE(2),
    questions: msg.readBigInt64BE(4),
  };
}
