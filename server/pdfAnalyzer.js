import { PDFParse } from "pdf-parse";

/**
 * Format PDF date strings like "D:20260826163232+05'30'" into human-readable dates
 */
function parsePdfDate(pdfDateStr) {
  if (!pdfDateStr || typeof pdfDateStr !== "string") return null;
  const match = pdfDateStr.match(/D:?(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return pdfDateStr;
  const [, y, m, d, h = "00", min = "00", s = "00"] = match;
  try {
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s)));
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return pdfDateStr;
  }
}

/**
 * Clean and normalize text
 */
function cleanText(str) {
  if (!str) return "";
  return str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Extract structured tables from lines with tab or multi-space separators
 */
function extractTablesFromPageText(pageText, pageNum) {
  const lines = pageText.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines) {
    if (line.includes("\t") || /\s{3,}/.test(line)) {
      const cells = line.split(/\t+|\s{3,}/).map((c) => c.trim()).filter((c) => c.length > 0);
      if (cells.length >= 2) {
        rows.push(cells);
      }
    }
  }

  if (rows.length === 0) return [];

  // Identify potential header row
  let headers = [];
  let dataRows = rows;
  const firstRow = rows[0];
  const headerKeywords = /sl\.?\s*no|unit|name|step|date|amount|id|desc|stage|status|officer|code|ref/i;
  const isHeaderLikely = firstRow.some((cell) => headerKeywords.test(cell));

  if (isHeaderLikely) {
    headers = firstRow;
    dataRows = rows.slice(1);
  } else {
    // Generate Col 1, Col 2, etc.
    const maxCols = Math.max(...rows.map((r) => r.length));
    headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
  }

  return [
    {
      page: pageNum,
      headers,
      rows: dataRows,
      rowCount: dataRows.length,
      colCount: headers.length
    }
  ];
}

/**
 * Extract smart entities: Amounts, Dates, Roles, Identifiers
 */
function extractEntities(fullText) {
  const entities = {
    amounts: [],
    percentages: [],
    dates: [],
    referenceIds: [],
    keyRoles: [],
    workflowSteps: []
  };

  // 1. Monetary amounts
  const amountRegex = /(?:₹|Rs\.?|INR|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{2})?\s*(?:lakhs?|crores?|\/-)/gi;
  const matchedAmounts = fullText.match(amountRegex) || [];
  entities.amounts = Array.from(new Set(matchedAmounts.map((a) => a.trim()))).slice(0, 30);

  // 2. Percentages
  const percentRegex = /\b\d+(?:\.\d+)?\s*%/g;
  const matchedPercents = fullText.match(percentRegex) || [];
  entities.percentages = Array.from(new Set(matchedPercents)).slice(0, 20);

  // 3. Dates
  const dateRegex = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  const matchedDates = fullText.match(dateRegex) || [];
  entities.dates = Array.from(new Set(matchedDates)).slice(0, 20);

  // 4. Identifiers / Codes (e.g. BILL-1001, WO-1234, etc.)
  const refRegex = /\b(?:BILL|WO|PO|DOC|INV|VOUCHER|REF|EST|SANCTION)[-_#A-Z0-9]+\b|\b(?:Sl\.?\s*No\.?\s*\d+)/gi;
  const matchedRefs = fullText.match(refRegex) || [];
  entities.referenceIds = Array.from(new Set(matchedRefs)).slice(0, 20);

  // 5. Common Government / Engineering / Billing Roles & Designations
  const roleKeywords = [
    "Tapal", "AE", "AEE", "EE", "JC", "Chief Engineer",
    "Additional Revenue Commissioner", "DCF", "Fund", "DC Bill",
    "Accounts", "Finance", "Auditor", "Audit Certification",
    "Case Worker", "Dean", "Superintendent", "Warden", "Matron",
    "CAO", "CSO", "GM Operations", "Treasury", "RMO", "Office Superintendent"
  ];
  const detectedRoles = [];
  for (const role of roleKeywords) {
    const escaped = role.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp(`\\b${escaped}\\b`, "i");
    if (reg.test(fullText)) {
      detectedRoles.push(role);
    }
  }
  entities.keyRoles = detectedRoles;

  // 6. Workflow steps mentioned (e.g., 1st Step, 2nd Step, Step 5, etc.)
  const stepRegex = /\b(?:(?:\d{1,2}(?:st|nd|rd|th)\s+Step)|(?:Step\s+\d{1,2}))\b/gi;
  const matchedSteps = fullText.match(stepRegex) || [];
  entities.workflowSteps = Array.from(new Set(matchedSteps)).slice(0, 25);

  return entities;
}

/**
 * Main PDF Analysis function
 * @param {Buffer} buffer - Raw file buffer of the uploaded PDF
 * @param {string} fileName - Original file name
 * @param {number} fileSize - Size in bytes
 */
export async function analyzePdfDocument(buffer, fileName = "document.pdf", fileSize = 0) {
  const result = {
    fileName,
    fileSize,
    analyzedAt: new Date().toISOString(),
    success: false,
    totalPages: 0,
    metadata: {},
    stats: {
      totalWords: 0,
      totalChars: 0,
      totalLines: 0,
      pageCount: 0
    },
    pages: [],
    tables: [],
    entities: {},
    summary: "",
    error: null
  };

  try {
    const parser = new PDFParse({ data: buffer });

    // 1. Extract metadata sequentially
    let rawInfo = null;
    try {
      rawInfo = await parser.getInfo();
    } catch (infoErr) {
      console.warn("Could not extract PDF info metadata:", infoErr.message);
    }

    const info = rawInfo?.info || {};
    result.metadata = {
      pdfFormatVersion: info.PDFFormatVersion || rawInfo?.version || "Standard PDF",
      title: info.Title || fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
      author: info.Author || "Not specified",
      creator: info.Creator || "Not specified",
      producer: info.Producer || "Unknown Producer",
      subject: info.Subject || null,
      keywords: info.Keywords || null,
      creationDateRaw: info.CreationDate || null,
      creationDate: parsePdfDate(info.CreationDate),
      modDateRaw: info.ModDate || null,
      modDate: parsePdfDate(info.ModDate),
      isLinearized: Boolean(info.IsLinearized),
      isAcroFormPresent: Boolean(info.IsAcroFormPresent),
      isSignaturesPresent: Boolean(info.IsSignaturesPresent),
      isEncrypted: Boolean(info.EncryptFilterName)
    };

    // 2. Extract full text and page breakdown
    const textResult = await parser.getText();
    const rawPages = textResult.pages || [];
    result.totalPages = textResult.total || rawPages.length || 1;

    let totalWords = 0;
    let totalChars = 0;
    let totalLines = 0;
    const allTables = [];

    result.pages = rawPages.map((p, idx) => {
      const pageNum = p.num || idx + 1;
      const text = cleanText(p.text || "");
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const words = (text.trim().match(/\S+/g) || []).length;
      const chars = text.length;

      totalWords += words;
      totalChars += chars;
      totalLines += lines.length;

      // Extract tables on this page
      const pageTables = extractTablesFromPageText(text, pageNum);
      if (pageTables.length > 0) {
        allTables.push(...pageTables);
      }

      return {
        pageNumber: pageNum,
        text,
        wordCount: words,
        charCount: chars,
        lineCount: lines.length,
        lines: lines.slice(0, 100), // sample lines for fast rendering
        hasTables: pageTables.length > 0
      };
    });

    result.tables = allTables;
    result.stats = {
      totalWords,
      totalChars,
      totalLines,
      pageCount: result.totalPages,
      tableCount: allTables.length,
      totalTableRows: allTables.reduce((acc, t) => acc + (t.rowCount || 0), 0)
    };

    // 3. Extract smart entities across full text
    const fullText = textResult.text || result.pages.map((p) => p.text).join("\n\n");
    result.entities = extractEntities(fullText);

    // 4. Generate intelligent summary
    const summaryParts = [
      `PDF document containing ${result.totalPages} page${result.totalPages === 1 ? "" : "s"} and ${totalWords.toLocaleString()} words.`
    ];

    if (result.metadata.producer && result.metadata.producer !== "Unknown Producer") {
      summaryParts.push(`Generated using ${result.metadata.producer}.`);
    }

    if (allTables.length > 0) {
      const rowSum = allTables.reduce((acc, t) => acc + (t.rowCount || 0), 0);
      summaryParts.push(`Contains ${allTables.length} tabular dataset${allTables.length === 1 ? "" : "s"} with ${rowSum} total records.`);
    }

    if (result.entities.keyRoles.length > 0) {
      summaryParts.push(`Identified ${result.entities.keyRoles.length} administrative / process authorities (${result.entities.keyRoles.slice(0, 5).join(", ")}${result.entities.keyRoles.length > 5 ? "..." : ""}).`);
    }

    if (result.entities.workflowSteps.length > 0) {
      summaryParts.push(`Detected ${result.entities.workflowSteps.length} sequential workflow references.`);
    }

    if (result.entities.amounts.length > 0) {
      summaryParts.push(`Detected financial values: ${result.entities.amounts.slice(0, 4).join(", ")}.`);
    }

    result.summary = summaryParts.join(" ");
    result.success = true;
  } catch (err) {
    console.error("PDF analysis error:", err);
    result.error = err.message || "Failed to parse PDF document";
    result.success = false;
  }

  return result;
}
