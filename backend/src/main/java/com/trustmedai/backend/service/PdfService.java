package com.trustmedai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.trustmedai.backend.entity.PredictionHistory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class PdfService {

    private static final BaseColor PRIMARY = new BaseColor(16, 185, 129);
    private static final BaseColor PRIMARY_DARK = new BaseColor(7, 17, 26);
    private static final BaseColor CARD_BG = new BaseColor(245, 250, 252);
    private static final BaseColor BORDER = new BaseColor(220, 230, 235);
    private static final BaseColor TEXT_DARK = new BaseColor(33, 37, 41);
    private static final BaseColor MUTED = new BaseColor(108, 117, 125);
    private static final BaseColor HIGH = new BaseColor(220, 53, 69);
    private static final BaseColor MEDIUM = new BaseColor(245, 158, 11);
    private static final BaseColor LOW = new BaseColor(34, 197, 94);
    private final QRCodeService qrCodeService;
    public byte[] generatePdf(PredictionHistory history) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4, 36, 36, 90, 60);
        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new TrustMedAiPageEvent());

        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, PRIMARY_DARK);
        Font subTitleFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, MUTED);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, PRIMARY_DARK);
        Font labelFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, PRIMARY_DARK);
        Font valueFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, TEXT_DARK);
        Font smallFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, MUTED);
        Font whiteBold = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

        Paragraph reportTitle = new Paragraph("Medical Analysis Report", titleFont);
        reportTitle.setAlignment(Element.ALIGN_CENTER);
        reportTitle.setSpacingAfter(6f);
        document.add(reportTitle);

        Paragraph reportSubTitle = new Paragraph(
                "AI-driven disease assessment with cryptographic integrity verification",
                subTitleFont
        );
        reportSubTitle.setAlignment(Element.ALIGN_CENTER);
        reportSubTitle.setSpacingAfter(18f);
        document.add(reportSubTitle);

        addSectionTitle(document, "Patient Information", sectionFont);
        PdfPTable infoTable = createInfoTable();
        addInfoRow(infoTable, "Report Name", safe(history.getReportName()), labelFont, valueFont);
        addInfoRow(infoTable, "User Email", safe(history.getUserEmail()), labelFont, valueFont);
        addInfoRow(
                infoTable,
                "Generated On",
                history.getCreatedAt() != null
                        ? history.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                        : "-",
                labelFont,
                valueFont
        );
        document.add(infoTable);
        document.add(space());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(history.getPredictionResult());
        JsonNode predictions = root.get("predictions");
        JsonNode parameters = root.get("parameters");
        addSectionTitle(document, "Disease Prediction Summary", sectionFont);
        PdfPTable predictionTable = new PdfPTable(new float[]{3.2f, 2f, 2f});
        predictionTable.setWidthPercentage(100);
        predictionTable.setSpacingBefore(4f);

        predictionTable.addCell(createTableHeader("Disease", whiteBold));
        predictionTable.addCell(createTableHeader("Risk", whiteBold));
        predictionTable.addCell(createTableHeader("Probability", whiteBold));

        if (predictions != null && predictions.isArray()) {
            for (JsonNode item : predictions) {
                predictionTable.addCell(createBodyCell(item.path("disease").asText("-"), valueFont));
                predictionTable.addCell(createRiskCell(item.path("risk").asText("Low")));
                predictionTable.addCell(createBodyCell(String.format("%.1f %%", item.path("probability").asDouble(0)), valueFont));
            }
        }

        document.add(predictionTable);
        document.add(space());
        addSectionTitle(document, "AI Clinical Summary", sectionFont);

        PdfPTable summaryTable = new PdfPTable(1);
        summaryTable.setWidthPercentage(100);

        String summary =
                "The AI analysis indicates a high probability of the detected disease. "
                        + "The prediction is primarily influenced by the patient's clinical "
                        + "parameters and explainable AI feature importance. "
                        + "This result should be reviewed together with laboratory findings "
                        + "by a qualified medical professional.";

        PdfPCell summaryCell =
                new PdfPCell(new Phrase(summary, valueFont));

        summaryCell.setPadding(12f);
        summaryCell.setBackgroundColor(new BaseColor(248,252,255));
        summaryCell.setBorderColor(BORDER);

        summaryTable.addCell(summaryCell);

        document.add(summaryTable);

        document.add(space());
        addSectionTitle(
                document,
                "Clinical Parameters",
                sectionFont
        );

        PdfPTable parameterTable =
                createInfoTable();
        if (parameters != null) {

            parameters.fields().forEachRemaining(entry -> {

                addInfoRow(
                        parameterTable,
                        capitalize(entry.getKey()),
                        entry.getValue().asText(),
                        labelFont,
                        valueFont
                );

            });

        }
        document.add(parameterTable);

        document.add(space());
        addSectionTitle(document, "Top Risk Factors", sectionFont);
        if (predictions != null && predictions.isArray()) {
            for (JsonNode item : predictions) {
                PdfPTable factorBlock = new PdfPTable(1);
                factorBlock.setWidthPercentage(100);

                PdfPCell diseaseCell = new PdfPCell(new Phrase(item.path("disease").asText("-"), labelFont));
                diseaseCell.setBackgroundColor(new BaseColor(232, 245, 242));
                diseaseCell.setPadding(10f);
                diseaseCell.setBorderColor(BORDER);
                factorBlock.addCell(diseaseCell);

                JsonNode factors = item.get("topFactors");
                if (factors != null && factors.isArray() && factors.size() > 0) {
                    for (JsonNode factor : factors) {
                        String line = "• " + factor.path("feature").asText("-")
                                + "   |   Impact: " + String.format("%.3f", factor.path("impact").asDouble(0));
                        PdfPCell factorCell = new PdfPCell(new Phrase(line, valueFont));
                        factorCell.setPadding(9f);
                        factorCell.setBorderColor(BORDER);
                        factorCell.setBackgroundColor(BaseColor.WHITE);
                        factorBlock.addCell(factorCell);
                    }
                } else {
                    PdfPCell emptyCell = new PdfPCell(new Phrase("No top factors available.", smallFont));
                    emptyCell.setPadding(9f);
                    emptyCell.setBorderColor(BORDER);
                    emptyCell.setBackgroundColor(BaseColor.WHITE);
                    factorBlock.addCell(emptyCell);
                }

                factorBlock.setSpacingAfter(10f);
                document.add(factorBlock);
            }
        }
        addSectionTitle(
                document,
                "Recommended Hospitals",
                sectionFont
        );

        PdfPTable hospitalTable =
                new PdfPTable(4);

        hospitalTable.setWidthPercentage(100);

        hospitalTable.setWidths(
                new float[]{4f,3f,1.5f,2f}
        );
        hospitalTable.addCell(
                createTableHeader(
                        "Hospital",
                        whiteBold
                )
        );

        hospitalTable.addCell(
                createTableHeader(
                        "Specialist",
                        whiteBold
                )
        );

        hospitalTable.addCell(
                createTableHeader(
                        "HSS",
                        whiteBold
                )
        );

        hospitalTable.addCell(
                createTableHeader(
                        "Priority",
                        whiteBold
                )
        );
        String verificationUrl =
                "http://localhost:3000/verify-report?hash="
                        + history.getCurrentHash();

        byte[] qrBytes =
                qrCodeService.generateQRCode(
                        verificationUrl,
                        220,
                        220
                );

        Image qrImage = Image.getInstance(qrBytes);

        qrImage.scaleToFit(120, 120);
        boolean fabricCommitted = "FABRIC_COMMITTED".equals(history.getLedgerStatus());
        addSectionTitle(document, fabricCommitted ? "Hyperledger Fabric Verification" : "Integrity Chain Verification", sectionFont);

        PdfPTable blockchainTable = createInfoTable();
        addInfoRow(blockchainTable, "Status", fabricCommitted ? "Committed to Hyperledger Fabric ✓" : "Local integrity chain", labelFont, valueFont);
        if (fabricCommitted) {
            addInfoRow(blockchainTable, "Fabric Transaction", shortHash(history.getFabricTransactionId(), false), labelFont, valueFont);
            addInfoRow(blockchainTable, "Fabric Channel", safe(history.getFabricChannel()), labelFont, valueFont);
        }
        addInfoRow(blockchainTable, "Block Number", String.valueOf(history.getBlockNumber()), labelFont, valueFont);
        addInfoRow(blockchainTable, "Previous Hash", shortHash(history.getPreviousHash(), true), labelFont, valueFont);
        addInfoRow(blockchainTable, "Current Hash", shortHash(history.getCurrentHash(), false), labelFont, valueFont);
        document.add(blockchainTable);
        Paragraph qrTitle = new Paragraph(
                "Scan this QR Code to verify the report authenticity.",
                valueFont
        );

        qrTitle.setSpacingBefore(12f);
        qrTitle.setAlignment(Element.ALIGN_CENTER);

        document.add(qrTitle);

        qrImage.setAlignment(Image.ALIGN_CENTER);

        document.add(qrImage);
        document.add(space());

        addSectionTitle(document, "Clinical Disclaimer", sectionFont);
        PdfPTable disclaimerBox = new PdfPTable(1);
        disclaimerBox.setWidthPercentage(100);
        PdfPCell disclaimerCell = new PdfPCell(new Phrase(
                "This report was generated using the TrustMedAI AI prediction engine and cryptographic integrity verification. "
                        + "It is intended to assist healthcare professionals and should not replace clinical diagnosis.",
                valueFont
        ));
        disclaimerCell.setPadding(12f);
        disclaimerCell.setBackgroundColor(new BaseColor(250, 252, 253));
        disclaimerCell.setBorderColor(BORDER);
        disclaimerBox.addCell(disclaimerCell);
        document.add(disclaimerBox);

        document.close();
        return out.toByteArray();
    }

    private void addSectionTitle(Document document, String text, Font font) throws DocumentException {
        Paragraph heading = new Paragraph(text, font);
        heading.setSpacingBefore(6f);
        heading.setSpacingAfter(8f);
        document.add(heading);
    }

    private PdfPTable createInfoTable() throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{2.2f, 4.8f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(4f);
        return table;
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(CARD_BG);
        labelCell.setBorderColor(BORDER);
        labelCell.setPadding(10f);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBackgroundColor(BaseColor.WHITE);
        valueCell.setBorderColor(BORDER);
        valueCell.setPadding(10f);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private PdfPCell createTableHeader(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(PRIMARY_DARK);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(10f);
        cell.setBorderColor(PRIMARY_DARK);
        return cell;
    }

    private PdfPCell createBodyCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(9f);
        cell.setBackgroundColor(BaseColor.WHITE);
        cell.setBorderColor(BORDER);
        return cell;
    }

    private PdfPCell createRiskCell(String risk) {
        String normalized = risk == null ? "Low" : risk.trim();
        BaseColor bg;
        String label;

        if (normalized.equalsIgnoreCase("High")) {
            bg = new BaseColor(253, 230, 230);
            label = "High";
        } else if (normalized.equalsIgnoreCase("Medium") || normalized.equalsIgnoreCase("Moderate")) {
            bg = new BaseColor(255, 243, 224);
            label = "Medium";
        } else {
            bg = new BaseColor(232, 249, 238);
            label = "Low";
        }

        Font riskFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD,
                label.equals("High") ? HIGH : label.equals("Medium") ? MEDIUM : LOW);

        PdfPCell cell = new PdfPCell(new Phrase(label, riskFont));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(9f);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(BORDER);
        return cell;
    }

    private Paragraph space() {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(6f);
        return p;
    }

    private String shortHash(String hash, boolean genesisIfEmpty) {
        if (hash == null || hash.isBlank()) {
            return genesisIfEmpty ? "GENESIS" : "-";
        }
        return hash.length() > 24 ? hash.substring(0, 24) + "..." : hash;
    }
    private String capitalize(String text) {

        if (text == null || text.isBlank()) {
            return "-";
        }

        return text.substring(0, 1).toUpperCase()
                + text.substring(1)
                .replace("_", " ");

    }
    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    static class TrustMedAiPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                PdfPTable header = new PdfPTable(2);
                header.setTotalWidth(document.right() - document.left());
                header.setWidths(new float[]{3.5f, 2f});

                PdfPCell left = new PdfPCell();
                left.setBorder(Rectangle.BOTTOM);
                left.setBorderColor(new BaseColor(210, 225, 230));
                left.setPaddingBottom(10f);
                left.setPhrase(new Phrase("TrustMedAI\nAI + Blockchain Powered Healthcare",
                        new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, PRIMARY_DARK)));

                PdfPCell right = new PdfPCell();
                right.setBorder(Rectangle.BOTTOM);
                right.setBorderColor(new BaseColor(210, 225, 230));
                right.setHorizontalAlignment(Element.ALIGN_RIGHT);
                right.setPaddingBottom(10f);
                right.setPhrase(new Phrase("Medical Analysis Report",
                        new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, MUTED)));

                header.addCell(left);
                header.addCell(right);

                header.writeSelectedRows(
                        0,
                        -1,
                        document.left(),
                        document.top() + 48,
                        writer.getDirectContent()
                );

                PdfPTable footer = new PdfPTable(3);
                footer.setTotalWidth(document.right() - document.left());
                footer.setWidths(new float[]{3f, 2f, 1f});

                PdfPCell f1 = new PdfPCell(new Phrase(
                        "Confidential clinical support document",
                        new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, MUTED)
                ));
                f1.setBorder(Rectangle.TOP);
                f1.setBorderColor(new BaseColor(210, 225, 230));
                f1.setPaddingTop(8f);

                PdfPCell f2 = new PdfPCell(new Phrase(
                        "Generated by TrustMedAI",
                        new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, MUTED)
                ));
                f2.setHorizontalAlignment(Element.ALIGN_CENTER);
                f2.setBorder(Rectangle.TOP);
                f2.setBorderColor(new BaseColor(210, 225, 230));
                f2.setPaddingTop(8f);

                PdfPCell f3 = new PdfPCell(new Phrase(
                        "Page " + writer.getPageNumber(),
                        new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, MUTED)
                ));
                f3.setHorizontalAlignment(Element.ALIGN_RIGHT);
                f3.setBorder(Rectangle.TOP);
                f3.setBorderColor(new BaseColor(210, 225, 230));
                f3.setPaddingTop(8f);

                footer.addCell(f1);
                footer.addCell(f2);
                footer.addCell(f3);

                footer.writeSelectedRows(
                        0,
                        -1,
                        document.left(),
                        document.bottom() - 18,
                        writer.getDirectContent()
                );
            } catch (Exception e) {
                throw new ExceptionConverter(e);
            }
        }
    }
}
