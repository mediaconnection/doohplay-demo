import { pdf } from "@react-pdf/renderer";
import { Document, Page, Text } from "@react-pdf/renderer";
import fs from "fs";

const input = JSON.parse(process.argv[2]);
const outputPath = process.argv[3];

const Doc = () => (
  <Document>
    <Page>
      <Text>DOOHPLAY Certified Report</Text>
      <Text>{JSON.stringify(input, null, 2)}</Text>
    </Page>
  </Document>
);

async function run() {
  const buffer = await pdf(<Doc />).toBuffer();
  fs.writeFileSync(outputPath, buffer);
}

run();
