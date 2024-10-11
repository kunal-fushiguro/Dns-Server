interface DnsPacket {
  transactionId: number;
  flags: BigInt;
  questions: BigInt;
}

export function buildDNSResponse(query: DnsPacket, ip: string): Buffer {
  // Create a dynamic buffer (adjust size as needed)
  const response = Buffer.alloc(512); // Maximum size is 512, but we'll shrink it later

  // 1. Write Transaction ID (2 bytes)
  response.writeUInt16BE(query.transactionId, 0);

  // 2. Write Flags (2 bytes) - set as a standard response
  // QR (response), Opcode (0 = standard query), AA (authoritative), etc.
  response.writeUInt16BE(0x8180, 2); // Standard response flags

  // 3. Write Questions Count (2 bytes)
  response.writeUInt16BE(1, 4); // Echo back the single question

  // 4. Write Answer RRs (2 bytes)
  response.writeUInt16BE(1, 6); // One answer record

  // 5. Authority RRs (2 bytes, zero since we're not providing it)
  response.writeUInt16BE(0, 8);

  // 6. Additional RRs (2 bytes, zero since we're not providing it)
  response.writeUInt16BE(0, 10);

  // --- Question Section ---
  // Copy the domain name from the query (assuming it's simple and already parsed)

  let offset = 12; // Offset starts after the 12-byte DNS header

  // Example of hardcoded domain name "example.com"
  const domainParts = ["example", "com"];
  domainParts.forEach((part) => {
    response.writeUInt8(part.length, offset); // Write length of the label
    offset += 1;
    response.write(part, offset); // Write the label itself
    offset += part.length;
  });
  response.writeUInt8(0, offset); // End of domain name (zero byte)
  offset += 1;

  // 7. Type (A = 1)
  response.writeUInt16BE(1, offset);
  offset += 2;

  // 8. Class (IN = 1)
  response.writeUInt16BE(1, offset);
  offset += 2;

  // --- Answer Section ---
  // 9. Copy the same domain name in the answer section
  domainParts.forEach((part) => {
    response.writeUInt8(part.length, offset); // Length of the label
    offset += 1;
    response.write(part, offset); // Write the label itself
    offset += part.length;
  });
  response.writeUInt8(0, offset); // End of domain name (zero byte)
  offset += 1;

  // 10. Type (A = 1)
  response.writeUInt16BE(1, offset);
  offset += 2;

  // 11. Class (IN = 1)
  response.writeUInt16BE(1, offset);
  offset += 2;

  // 12. Time to live (TTL, set to a reasonable value like 300 seconds)
  response.writeUInt32BE(300, offset);
  offset += 4;

  // 13. Data length (for an IPv4 address, it's 4 bytes)
  response.writeUInt16BE(4, offset);
  offset += 2;

  // 14. Write the resolved IP address (e.g., "93.184.216.34" for example.com)
  const ipParts = ip.split(".").map(Number); // Split the IP into its 4 octets
  ipParts.forEach((octet) => {
    response.writeUInt8(octet, offset);
    offset += 1;
  });

  // Finally, slice the buffer to the actual length of the response
  return response.slice(0, offset);
}
