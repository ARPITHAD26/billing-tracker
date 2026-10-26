import React, { useState, useMemo, useEffect } from "react";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function PdfInspectorModal({ doc, onClose, billId, fetchWithAuth }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPageNum, setSelectedPageNum] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [analysis, setAnalysis] = useState(doc?.pdfAnalysis || null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(!doc?.pdfAnalysis);
  const [selectedTableIdx, setSelectedTableIdx] = useState(0);
  const [tableSearch, setTableSearch] = useState("");

  // Fetch analysis if not present
  useEffect(() => {
    if (!analysis && doc?.id && billId && fetchWithAuth) {
      let isMounted = true;
      setLoadingAnalysis(true);
      fetchWithAuth(`http://localhost:4000/api/bills/${billId}/documents/${doc.id}/analysis`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && data.analysis) {
            setAnalysis(data.analysis);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch PDF analysis:", err);
        })
        .finally(() => {
          if (isMounted) setLoadingAnalysis(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [analysis, doc, billId, fetchWithAuth]);

  // Copy to clipboard helper
  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`✓ ${label} copied to clipboard`);
      setTimeout(() => setCopyFeedback(""), 3000);
    });
  };

  // Export parsed table as CSV
  const handleExportCsv = (table) => {
    if (!table || !table.rows) return;
    const headerRow = (table.headers || []).map((h) => `"${(h || "").replace(/"/g, '""')}"`).join(",");
    const dataRows = (table.rows || []).map((row) =>
      row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...dataRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${doc.name.replace(/\.pdf$/i, "")}_table_${selectedTableIdx + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pages to display based on selected page filter
  const displayedPages = useMemo(() => {
    if (!analysis || !analysis.pages) return [];
    if (selectedPageNum === "all") return analysis.pages;
    return analysis.pages.filter((p) => p.pageNumber === Number(selectedPageNum));
  }, [analysis, selectedPageNum]);

  // Search match count in text
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim() || !analysis || !analysis.pages) return 0;
    const q = searchQuery.toLowerCase();
    let count = 0;
    for (const page of analysis.pages) {
      let pos = 0;
      const lower = page.text.toLowerCase();
      while ((pos = lower.indexOf(q, pos)) !== -1) {
        count++;
        pos += q.length;
      }
    }
    return count;
  }, [searchQuery, analysis]);

  // Filtered table rows
  const activeTable = analysis?.tables?.[selectedTableIdx] || null;
  const filteredTableRows = useMemo(() => {
    if (!activeTable) return [];
    if (!tableSearch.trim()) return activeTable.rows;
    const q = tableSearch.toLowerCase();
    return activeTable.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(q))
    );
  }, [activeTable, tableSearch]);

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="pdf-search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const totalPages = analysis?.totalPages || 1;
  const totalWords = analysis?.stats?.totalWords || 0;
  const totalChars = analysis?.stats?.totalChars || 0;
  const tableCount = analysis?.tables?.length || 0;
  const metadata = analysis?.metadata || {};
  const entities = analysis?.entities || {};

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div
        className="pdf-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-inspector-title"
      >
        {/* Modal Header */}
        <header className="pdf-modal-header">
          <div className="pdf-modal-header-left">
            <div className="pdf-header-icon">📄</div>
            <div className="pdf-header-title-box">
              <div className="pdf-header-badges">
                <span className="pdf-badge pdf-format-badge">
                  {metadata.pdfFormatVersion ? `PDF ${metadata.pdfFormatVersion}` : "PDF Document"}
                </span>
                <span className="pdf-badge pdf-pages-badge">
                  {totalPages} {totalPages === 1 ? "Page" : "Pages"}
                </span>
                {totalWords > 0 && (
                  <span className="pdf-badge pdf-words-badge">
                    {totalWords.toLocaleString()} Words
                  </span>
                )}
                {tableCount > 0 && (
                  <span className="pdf-badge pdf-tables-badge">
                    {tableCount} {tableCount === 1 ? "Table Detected" : "Tables Detected"}
                  </span>
                )}
                {metadata.isEncrypted && (
                  <span className="pdf-badge pdf-encrypted-badge">🔒 Encrypted</span>
                )}
              </div>
              <h2 id="pdf-inspector-title" className="pdf-modal-title" title={doc.name}>
                {doc.name}
              </h2>
              <div className="pdf-modal-submeta">
                <span>Size: {formatFileSize(doc.size)}</span>
                <span>•</span>
                <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                {doc.uploadedBy && (
                  <>
                    <span>•</span>
                    <span>By: {doc.uploadedBy}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pdf-modal-header-actions">
            {copyFeedback && <div className="pdf-copy-feedback-pill">{copyFeedback}</div>}

            <button
              type="button"
              className="pdf-btn-action"
              onClick={() => {
                const allText = (analysis?.pages || []).map((p) => `--- PAGE ${p.pageNumber} ---\n` + p.text).join("\n\n");
                handleCopy(allText, "Full document text");
              }}
              title="Copy entire document text"
            >
              📋 Copy Text
            </button>

            <button
              type="button"
              className="pdf-btn-action"
              onClick={() => handleCopy(JSON.stringify(analysis || doc, null, 2), "JSON analysis")}
              title="Copy complete structured JSON analysis"
            >
              {`{ }`} JSON
            </button>

            <a
              href={doc.url}
              download={doc.name}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-btn-action primary"
              title="Download original PDF"
            >
              ⬇ Download
            </a>

            <button
              type="button"
              className="pdf-btn-close"
              onClick={onClose}
              aria-label="Close modal"
              title="Close modal (Esc)"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="pdf-modal-tabs">
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Executive Overview & Insights
          </button>
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "reader" ? "active" : ""}`}
            onClick={() => setActiveTab("reader")}
          >
            📑 Page-by-Page Content Reader
          </button>
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "tables" ? "active" : ""}`}
            onClick={() => setActiveTab("tables")}
          >
            📊 Data Tables & Grids
            {tableCount > 0 && <span className="tab-counter-badge">{tableCount}</span>}
          </button>
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "entities" ? "active" : ""}`}
            onClick={() => setActiveTab("entities")}
          >
            🏷️ Smart Extracted Entities
            {(entities.keyRoles?.length || 0) + (entities.amounts?.length || 0) > 0 && (
              <span className="tab-counter-badge">
                {(entities.keyRoles?.length || 0) + (entities.amounts?.length || 0) + (entities.workflowSteps?.length || 0)}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            🖼️ Live Visual PDF Preview
          </button>
          <button
            type="button"
            className={`pdf-tab-btn ${activeTab === "technical" ? "active" : ""}`}
            onClick={() => setActiveTab("technical")}
          >
            ⚙️ Technical Metadata & Audit
          </button>
        </nav>

        {/* Content Body */}
        <div className="pdf-modal-body">
          {loadingAnalysis ? (
            <div className="pdf-loading-state">
              <div className="pdf-spinner" />
              <h3>Analyzing PDF Structure & Text…</h3>
              <p>Extracting metadata, tables, process workflows, and textual entities.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE OVERVIEW */}
              {activeTab === "overview" && (
                <div className="pdf-tab-content pdf-overview-tab">
                  {/* KPI Cards */}
                  <div className="pdf-kpi-grid">
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">📑</div>
                      <div className="kpi-value">{totalPages}</div>
                      <div className="kpi-label">Total Pages</div>
                      <div className="kpi-sub">Fully extracted</div>
                    </div>
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">📝</div>
                      <div className="kpi-value">{totalWords.toLocaleString()}</div>
                      <div className="kpi-label">Word Count</div>
                      <div className="kpi-sub">{totalChars.toLocaleString()} characters</div>
                    </div>
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">📊</div>
                      <div className="kpi-value">{tableCount}</div>
                      <div className="kpi-label">Detected Tables</div>
                      <div className="kpi-sub">
                        {analysis?.stats?.totalTableRows || 0} structured records
                      </div>
                    </div>
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">👥</div>
                      <div className="kpi-value">{entities.keyRoles?.length || 0}</div>
                      <div className="kpi-label">Authorities / Roles</div>
                      <div className="kpi-sub">Identified in document</div>
                    </div>
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">🔄</div>
                      <div className="kpi-value">{entities.workflowSteps?.length || 0}</div>
                      <div className="kpi-label">Workflow Steps</div>
                      <div className="kpi-sub">Sequential references</div>
                    </div>
                    <div className="pdf-kpi-card">
                      <div className="kpi-icon">💰</div>
                      <div className="kpi-value">{entities.amounts?.length || 0}</div>
                      <div className="kpi-label">Financial Figures</div>
                      <div className="kpi-sub">Amounts & percentages</div>
                    </div>
                  </div>

                  {/* Summary Banner */}
                  {analysis?.summary && (
                    <div className="pdf-summary-banner">
                      <div className="summary-banner-header">
                        <span className="ai-sparkle">✨</span>
                        <h3>Executive Document Intelligence Summary</h3>
                      </div>
                      <p className="summary-text">{analysis.summary}</p>
                    </div>
                  )}

                  {/* Two column detail cards */}
                  <div className="pdf-details-two-col">
                    {/* Metadata Card */}
                    <div className="pdf-card">
                      <h3 className="pdf-card-title">📄 Document File Metadata</h3>
                      <div className="pdf-meta-table">
                        <div className="meta-row">
                          <span className="meta-key">Document Title</span>
                          <span className="meta-val highlight">{metadata.title || doc.name}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">PDF Version</span>
                          <span className="meta-val">{metadata.pdfFormatVersion || "1.7"}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Producer / Application</span>
                          <span className="meta-val">{metadata.producer || "Microsoft: Print To PDF"}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Author / Creator</span>
                          <span className="meta-val">
                            {metadata.author && metadata.author !== "Not specified"
                              ? metadata.author
                              : metadata.creator || "System Export"}
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Creation Date</span>
                          <span className="meta-val">{metadata.creationDate || formatDate(doc.uploadedAt)}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Modification Date</span>
                          <span className="meta-val">{metadata.modDate || "-"}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">File Size</span>
                          <span className="meta-val">
                            {formatFileSize(doc.size)} ({doc.size?.toLocaleString()} bytes)
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Encrypted / Secured</span>
                          <span className="meta-val">{metadata.isEncrypted ? "Yes (Protected)" : "No (Standard Public)"}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-key">Interactive Form Fields</span>
                          <span className="meta-val">{metadata.isAcroFormPresent ? "Present" : "None"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Highlights Card */}
                    <div className="pdf-card">
                      <h3 className="pdf-card-title">⚡ Fast Entity Breakdown</h3>

                      {entities.keyRoles && entities.keyRoles.length > 0 && (
                        <div className="entity-section">
                          <div className="entity-section-title">
                            Key Authorities & Process Roles ({entities.keyRoles.length})
                          </div>
                          <div className="entity-chips-wrap">
                            {entities.keyRoles.map((r, idx) => (
                              <span key={idx} className="entity-chip role">
                                👤 {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {entities.workflowSteps && entities.workflowSteps.length > 0 && (
                        <div className="entity-section">
                          <div className="entity-section-title">
                            Identified Workflow Stages ({entities.workflowSteps.length})
                          </div>
                          <div className="entity-chips-wrap">
                            {entities.workflowSteps.slice(0, 12).map((s, idx) => (
                              <span key={idx} className="entity-chip step">
                                📌 {s}
                              </span>
                            ))}
                            {entities.workflowSteps.length > 12 && (
                              <span className="entity-chip more">
                                +{entities.workflowSteps.length - 12} more steps
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {entities.amounts && entities.amounts.length > 0 && (
                        <div className="entity-section">
                          <div className="entity-section-title">
                            Financial Figures ({entities.amounts.length})
                          </div>
                          <div className="entity-chips-wrap">
                            {entities.amounts.map((a, idx) => (
                              <span key={idx} className="entity-chip amount">
                                💰 {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {entities.dates && entities.dates.length > 0 && (
                        <div className="entity-section">
                          <div className="entity-section-title">
                            Dates Extracted from Content ({entities.dates.length})
                          </div>
                          <div className="entity-chips-wrap">
                            {entities.dates.map((d, idx) => (
                              <span key={idx} className="entity-chip date">
                                📅 {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {tableCount > 0 && (
                        <div className="table-quick-banner">
                          <span>📊 {tableCount} Tabular Datasets detected in document.</span>
                          <button
                            type="button"
                            className="btn-inline-link"
                            onClick={() => setActiveTab("tables")}
                          >
                            View Data Grid →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PAGE-BY-PAGE READER */}
              {activeTab === "reader" && (
                <div className="pdf-tab-content pdf-reader-tab">
                  {/* Reader Toolbar */}
                  <div className="pdf-reader-toolbar">
                    <div className="pdf-reader-toolbar-left">
                      <label htmlFor="page-select" className="toolbar-label">
                        Page:
                      </label>
                      <select
                        id="page-select"
                        className="pdf-select"
                        value={selectedPageNum}
                        onChange={(e) => setSelectedPageNum(e.target.value)}
                      >
                        <option value="all">All Pages ({totalPages})</option>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Page {i + 1}
                          </option>
                        ))}
                      </select>

                      <div className="pdf-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          className="pdf-search-input"
                          placeholder="Search text in document…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <>
                            <span className="search-count">
                              {searchMatchCount} {searchMatchCount === 1 ? "match" : "matches"}
                            </span>
                            <button
                              type="button"
                              className="clear-search-btn"
                              onClick={() => setSearchQuery("")}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pdf-reader-toolbar-right">
                      <button
                        type="button"
                        className={`pdf-btn-toggle ${showLineNumbers ? "active" : ""}`}
                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                        title="Toggle line numbers"
                      >
                        # Lines
                      </button>

                      <div className="font-size-control">
                        <button
                          type="button"
                          className="btn-font-size"
                          onClick={() => setFontSize((s) => Math.max(10, s - 1))}
                          title="Decrease font size"
                        >
                          A-
                        </button>
                        <span className="font-size-val">{fontSize}px</span>
                        <button
                          type="button"
                          className="btn-font-size"
                          onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                          title="Increase font size"
                        >
                          A+
                        </button>
                      </div>

                      <button
                        type="button"
                        className="pdf-btn-action"
                        onClick={() => {
                          const targetText = displayedPages.map((p) => p.text).join("\n\n");
                          handleCopy(targetText, selectedPageNum === "all" ? "All text" : `Page ${selectedPageNum} text`);
                        }}
                      >
                        📋 Copy Text
                      </button>
                    </div>
                  </div>

                  {/* Text Container */}
                  <div className="pdf-pages-scroll-container">
                    {displayedPages.length === 0 ? (
                      <div className="pdf-empty-box">No text content found for this selection.</div>
                    ) : (
                      displayedPages.map((page) => (
                        <div className="pdf-page-sheet" key={page.pageNumber}>
                          <div className="pdf-page-sheet-header">
                            <span className="page-sheet-num">PAGE {page.pageNumber} OF {totalPages}</span>
                            <div className="page-sheet-stats">
                              <span>{page.wordCount.toLocaleString()} words</span>
                              <span>•</span>
                              <span>{page.lineCount} lines</span>
                              <span>•</span>
                              <span>{page.charCount.toLocaleString()} characters</span>
                              <button
                                type="button"
                                className="btn-copy-page"
                                onClick={() => handleCopy(page.text, `Page ${page.pageNumber}`)}
                                title="Copy page text"
                              >
                                📋 Copy
                              </button>
                            </div>
                          </div>

                          <div
                            className="pdf-page-sheet-body"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {showLineNumbers ? (
                              <div className="pdf-line-view">
                                {page.text.split("\n").map((line, idx) => (
                                  <div className="pdf-line-row" key={idx}>
                                    <span className="line-num">{idx + 1}</span>
                                    <span className="line-content">
                                      {highlightText(line, searchQuery)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className="pdf-pre-text">
                                {highlightText(page.text, searchQuery)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TABULAR DATA & GRIDS */}
              {activeTab === "tables" && (
                <div className="pdf-tab-content pdf-tables-tab">
                  {tableCount === 0 ? (
                    <div className="pdf-empty-box">
                      <div className="empty-icon">📊</div>
                      <h3>No Structured Data Tables Detected</h3>
                      <p>
                        This PDF contains unstructured free-form text or paragraphs. You can view
                        and search the complete textual content under the <strong>Page-by-Page Content Reader</strong> tab.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Tables selector toolbar */}
                      <div className="pdf-table-toolbar">
                        <div className="pdf-table-toolbar-left">
                          <label className="toolbar-label">Dataset Table:</label>
                          <div className="table-tabs-list">
                            {analysis.tables.map((t, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`btn-table-tab ${selectedTableIdx === idx ? "active" : ""}`}
                                onClick={() => {
                                  setSelectedTableIdx(idx);
                                  setTableSearch("");
                                }}
                              >
                                Page {t.page} Table ({t.rowCount} rows)
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pdf-table-toolbar-right">
                          <div className="pdf-search-box">
                            <span className="search-icon">🔍</span>
                            <input
                              type="text"
                              className="pdf-search-input"
                              placeholder="Filter rows in table…"
                              value={tableSearch}
                              onChange={(e) => setTableSearch(e.target.value)}
                            />
                            {tableSearch && (
                              <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setTableSearch("")}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            className="pdf-btn-action primary"
                            onClick={() => handleExportCsv(activeTable)}
                            title="Download table as CSV file"
                          >
                            📥 Export CSV
                          </button>
                        </div>
                      </div>

                      {/* Data Grid */}
                      {activeTable && (
                        <div className="pdf-grid-wrapper">
                          <div className="grid-summary-bar">
                            <span>
                              Showing {filteredTableRows.length} of {activeTable.rowCount} records
                              {tableSearch && ` (filtered from query "${tableSearch}")`}
                            </span>
                            <span>{activeTable.headers.length} columns</span>
                          </div>

                          <div className="pdf-table-container">
                            <table className="pdf-data-table">
                              <thead>
                                <tr>
                                  <th className="col-row-idx">#</th>
                                  {activeTable.headers.map((h, i) => (
                                    <th key={i}>{h || `Col ${i + 1}`}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTableRows.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={activeTable.headers.length + 1}
                                      className="empty-cell"
                                    >
                                      No rows match "{tableSearch}"
                                    </td>
                                  </tr>
                                ) : (
                                  filteredTableRows.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      <td className="col-row-idx">{rIdx + 1}</td>
                                      {activeTable.headers.map((_, cIdx) => (
                                        <td key={cIdx}>
                                          {row[cIdx] ? highlightText(row[cIdx], tableSearch) : "-"}
                                        </td>
                                      ))}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: SMART EXTRACTED ENTITIES */}
              {activeTab === "entities" && (
                <div className="pdf-tab-content pdf-entities-tab">
                  <div className="entities-grid">
                    {/* Authorities & Key Stakeholders */}
                    <div className="entity-card">
                      <div className="entity-card-header">
                        <span className="card-icon">👥</span>
                        <div>
                          <h3>Identified Administrative & Billing Roles</h3>
                          <p>
                            Government, Engineering & Accounts authorities mentioned in document
                          </p>
                        </div>
                        <span className="entity-count-badge">
                          {entities.keyRoles?.length || 0}
                        </span>
                      </div>
                      <div className="entity-items-container">
                        {entities.keyRoles && entities.keyRoles.length > 0 ? (
                          entities.keyRoles.map((r, i) => (
                            <div key={i} className="entity-detail-pill">
                              <span className="dot role" />
                              <span className="pill-name">{r}</span>
                            </div>
                          ))
                        ) : (
                          <div className="empty-subtext">No standard role keywords identified.</div>
                        )}
                      </div>
                    </div>

                    {/* Sequential Workflow Milestones */}
                    <div className="entity-card">
                      <div className="entity-card-header">
                        <span className="card-icon">🔄</span>
                        <div>
                          <h3>Sequential Workflow Milestones</h3>
                          <p>Numbered stages and step references discovered across pages</p>
                        </div>
                        <span className="entity-count-badge">
                          {entities.workflowSteps?.length || 0}
                        </span>
                      </div>
                      <div className="entity-items-container steps">
                        {entities.workflowSteps && entities.workflowSteps.length > 0 ? (
                          entities.workflowSteps.map((s, i) => (
                            <div key={i} className="entity-detail-pill step">
                              <span className="step-num-circle">{i + 1}</span>
                              <span className="pill-name">{s}</span>
                            </div>
                          ))
                        ) : (
                          <div className="empty-subtext">No numbered steps found.</div>
                        )}
                      </div>
                    </div>

                    {/* Financial Figures & Percentages */}
                    <div className="entity-card">
                      <div className="entity-card-header">
                        <span className="card-icon">💰</span>
                        <div>
                          <h3>Financial Values & Amounts</h3>
                          <p>Currency figures, deductions, taxes, and percentages</p>
                        </div>
                        <span className="entity-count-badge">
                          {(entities.amounts?.length || 0) + (entities.percentages?.length || 0)}
                        </span>
                      </div>
                      <div className="entity-items-container">
                        {entities.amounts && entities.amounts.length > 0 ? (
                          entities.amounts.map((a, i) => (
                            <div key={i} className="entity-detail-pill amount">
                              <span className="dot amount" />
                              <span className="pill-name">{a}</span>
                            </div>
                          ))
                        ) : (
                          <div className="empty-subtext">No currency amounts detected.</div>
                        )}
                        {entities.percentages &&
                          entities.percentages.map((p, i) => (
                            <div key={`p-${i}`} className="entity-detail-pill percent">
                              <span className="dot percent" />
                              <span className="pill-name">{p}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Dates & Reference Codes */}
                    <div className="entity-card">
                      <div className="entity-card-header">
                        <span className="card-icon">📅</span>
                        <div>
                          <h3>Dates, Timestamps & References</h3>
                          <p>Document numbers, work orders, dates and identifiers</p>
                        </div>
                        <span className="entity-count-badge">
                          {(entities.dates?.length || 0) + (entities.referenceIds?.length || 0)}
                        </span>
                      </div>
                      <div className="entity-items-container">
                        {entities.dates &&
                          entities.dates.map((d, i) => (
                            <div key={`d-${i}`} className="entity-detail-pill date">
                              <span className="dot date" />
                              <span className="pill-name">{d}</span>
                            </div>
                          ))}
                        {entities.referenceIds &&
                          entities.referenceIds.map((ref, i) => (
                            <div key={`ref-${i}`} className="entity-detail-pill ref">
                              <span className="dot ref" />
                              <span className="pill-name">{ref}</span>
                            </div>
                          ))}
                        {(!entities.dates || entities.dates.length === 0) &&
                          (!entities.referenceIds || entities.referenceIds.length === 0) && (
                            <div className="empty-subtext">No explicit date strings or reference IDs found.</div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE PDF VISUAL PREVIEW */}
              {activeTab === "preview" && (
                <div className="pdf-tab-content pdf-preview-tab">
                  <div className="preview-toolbar">
                    <div className="preview-toolbar-info">
                      <span>Live visual rendering of original PDF file: <strong>{doc.name}</strong></span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-btn-action"
                    >
                      ↗ Open in New Window
                    </a>
                  </div>
                  <div className="pdf-embed-wrapper">
                    <iframe
                      src={`${doc.url}#toolbar=1&navpanes=1`}
                      title={`Visual Preview of ${doc.name}`}
                      className="pdf-iframe-viewer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: TECHNICAL METADATA */}
              {activeTab === "technical" && (
                <div className="pdf-tab-content pdf-technical-tab">
                  <div className="pdf-card">
                    <h3 className="pdf-card-title">Technical PDF Stream Specifications</h3>
                    <div className="pdf-meta-table">
                      <div className="meta-row">
                        <span className="meta-key">Raw PDF Format</span>
                        <span className="meta-val">{metadata.pdfFormatVersion || "1.7"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">File Size (Raw Bytes)</span>
                        <span className="meta-val">{doc.size} bytes</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Page Count (Total)</span>
                        <span className="meta-val">{totalPages}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Linearized (Fast Web View)</span>
                        <span className="meta-val">{metadata.isLinearized ? "True" : "False"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">AcroForm Interactive Fields</span>
                        <span className="meta-val">{metadata.isAcroFormPresent ? "True" : "False"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Digital Signatures Flag</span>
                        <span className="meta-val">{metadata.isSignaturesPresent ? "True" : "False"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Producer / PDF Engine</span>
                        <span className="meta-val">{metadata.producer || "-"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Creation Date (Raw PDF String)</span>
                        <span className="meta-val">{metadata.creationDateRaw || "-"}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Storage URL</span>
                        <span className="meta-val code">{doc.url}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pdf-card json-card">
                    <div className="json-card-header">
                      <h3 className="pdf-card-title">Raw Structured JSON Analysis</h3>
                      <button
                        type="button"
                        className="pdf-btn-action"
                        onClick={() => handleCopy(JSON.stringify(analysis, null, 2), "Full JSON")}
                      >
                        📋 Copy JSON
                      </button>
                    </div>
                    <pre className="json-code-box">
                      {JSON.stringify(analysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
