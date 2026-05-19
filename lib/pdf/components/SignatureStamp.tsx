import { View, Text, StyleSheet } from "@react-pdf/renderer"

type Props = {
  status: "VERIFIED" | "FAILED"
  hash: string
  authority: string
  timestamp?: string
}

export function SignatureStamp({
  status,
  hash,
  authority,
  timestamp
}: Props) {

  const isValid = status === "VERIFIED"

  const styles = StyleSheet.create({
    container: {
      marginTop: 20,
      padding: 12,
      borderRadius: 6,
      border: "2px solid " + (isValid ? "#16a34a" : "#dc2626"),
      backgroundColor: isValid ? "#ecfdf5" : "#fef2f2"
    },

    title: {
      fontSize: 12,
      fontWeight: "bold",
      color: isValid ? "#166534" : "#991b1b"
    },

    text: {
      fontSize: 9,
      marginTop: 2
    },

    hash: {
      fontSize: 8,
      marginTop: 4,
      color: "#444"
    }
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isValid ? "✔ VERIFIED DOCUMENT" : "✖ INVALID DOCUMENT"}
      </Text>

      <Text style={styles.text}>
        Signed by: {authority}
      </Text>

      {timestamp && (
        <Text style={styles.text}>
          Timestamp: {timestamp}
        </Text>
      )}

      <Text style={styles.hash}>
        Hash: {hash.slice(0, 16)}...
      </Text>
    </View>
  )
}