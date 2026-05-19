import java.io.*;
import java.security.GeneralSecurityException;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.*;
import org.apache.pdfbox.pdmodel.interactive.form.*;

public class SignPdf {

    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.out.println("Uso: java SignPdf input.pdf assinatura.p7s output.pdf");
            return;
        }

        File inputPdf = new File(args[0]);
        File signatureFile = new File(args[1]);
        File outputPdf = new File(args[2]);

        try (PDDocument document = PDDocument.load(inputPdf)) {

            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            if (acroForm == null) {
                acroForm = new PDAcroForm(document);
                document.getDocumentCatalog().setAcroForm(acroForm);
            }

            PDSignature signature = new PDSignature();
            signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
            signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
            signature.setName("DOOHPLAY");
            signature.setLocation("Brasil");
            signature.setReason("Assinatura Digital A1");
            signature.setSignDate(java.util.Calendar.getInstance());

            document.addSignature(signature);

            ExternalSigningSupport externalSigning =
                document.saveIncrementalForExternalSigning(
                    new FileOutputStream(outputPdf)
                );

            byte[] cmsSignature = readAll(signatureFile);
            externalSigning.setSignature(cmsSignature);
        }

        System.out.println("PDF assinado com sucesso: " + outputPdf.getName());
    }

    private static byte[] readAll(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            return fis.readAllBytes();
        }
    }
}
