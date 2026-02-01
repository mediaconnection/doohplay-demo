import { Document, Page, Text } from "@react-pdf/renderer";

export function ReportDocument({ data }: { data: any }) {
  return (
    <Document>
      <Page>
        <Text>DOOHPLAY Certified Report</Text>
        <Text>{JSON.stringify(data, null, 2)}</Text>
      </Page>
    </Document>
  );
}
