import dgram from "dgram";
import { parseDnsPackets } from "./packet";
import { buildDNSResponse } from "./response";

const server = dgram.createSocket("udp4");

server.on("listening", function () {
  console.log("DNS Server started on PORT : 8080");
});

server.on("message", function (msg, rinfo) {
  console.log(`Received message from ${rinfo.address}:${rinfo.port}`);
  //   console.log("msg : ", msg);
  const query = parseDnsPackets(msg);
  const domainName = getDomainNameFromQuery(msg);

  console.log(query);
  console.log(domainName);

  if (domainName === "example.com") {
    const response = buildDNSResponse(query, "93.184.216.34"); // example.com’s IP
    console.log(response);

    server.send(response, rinfo.port, rinfo.address);
  }
});

function getDomainNameFromQuery(queryBuffer: Buffer): string {
  let domainParts: string[] = [];
  let offset = 12; // DNS header is 12 bytes long

  while (true) {
    const length = queryBuffer.readUInt8(offset); // Read the length of the next label

    if (length === 0) {
      // A zero-length label marks the end of the domain name
      break;
    }

    // Extract the label and add it to the domainParts array
    domainParts.push(
      queryBuffer.toString("utf8", offset + 1, offset + 1 + length)
    );

    // Move the offset to the next label
    offset += length + 1;
  }

  // Join the labels to form the full domain name
  return domainParts.join(".");
}

server.bind(8080);
