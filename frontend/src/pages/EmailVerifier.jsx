import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

export function EmailVerifierPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const fileInputRef = useRef(null);

  const validateEmail = (email) => {
    // Basic regex validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) return { status: 'invalid', reason: 'Invalid format' };

    // Check for common temporary domains (simplified list)
    const disposableDomains = ['tempmail.com', 'throwawaymail.com', 'mailinator.com', 'yopmail.com'];
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) return { status: 'invalid', reason: 'Disposable domain' };

    return { status: 'valid', reason: 'Valid format' };
  };

  const processFile = (file) => {
    setIsVerifying(true);
    setProgress(0);
    setEmails([]);

    Papa.parse(file, {
      complete: (results) => {
        let rawRows = results.data;

        // Remove empty rows first
        rawRows = rawRows.filter(row => {
          const columns = Array.isArray(row) ? row : Object.values(row);
          return columns.some(col => col && typeof col === 'string' && col.trim() !== '');
        });

        if (rawRows.length === 0) {
          setIsVerifying(false);
          return;
        }

        // Simple Header Detection:
        // Check first row for common header keywords
        const firstRow = Array.isArray(rawRows[0]) ? rawRows[0] : Object.values(rawRows[0]);
        const headerKeywords = ['email', 'e-mail', 'mail', 'name', 'sr', 'no', 'id', 'status'];
        const isHeader = firstRow.some(col =>
          typeof col === 'string' && headerKeywords.some(kw => col.toLowerCase().includes(kw))
        );

        if (isHeader) {
          rawRows = rawRows.slice(1);
        }

        const total = rawRows.length;
        let processed = 0;
        let validCount = 0;
        let invalidCount = 0;

        const processedResults = rawRows.map(row => {
          const columns = Array.isArray(row) ? row : Object.values(row);

          // Find the first field that looks like an email using regex
          // Enhanced: Scan all fields, support extracting from text (e.g. "Name <email>")
          const emailRegexLoose = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

          let emailCandidate = null;

          // 1. Try to find a column that *is* an email (strict-ish check via loose regex on trimmed content)
          // We iterate all columns to find the first one that matches
          const strictMatch = columns.find(col =>
            typeof col === 'string' && emailRegexLoose.test(col.trim()) && col.trim().match(emailRegexLoose)[0] === col.trim()
          );

          if (strictMatch) {
            emailCandidate = strictMatch.trim();
          } else {
            // 2. If no strict match, try to extract an email from any column
            const looseMatchCol = columns.find(col => typeof col === 'string' && emailRegexLoose.test(col));
            if (looseMatchCol) {
              const match = looseMatchCol.match(emailRegexLoose);
              if (match) emailCandidate = match[0];
            }
          }

          let result;
          if (emailCandidate) {
            const validation = validateEmail(emailCandidate);
            result = { email: emailCandidate, ...validation };
          } else {
            // Use the first non-empty column as the "identifier" or just "Unknown"
            const identifier = columns.find(col => col && typeof col === 'string' && col.trim() !== '') || 'Unknown';
            // Mark as invalid specifically because no email was found
            result = { email: identifier, status: 'invalid', reason: 'No email found in row' };
          }

          if (result.status === 'valid') validCount++;
          else invalidCount++;

          processed++;
          setProgress(Math.round((processed / total) * 100));
          return result;
        });

        // Recalculate total based on filtered results
        const finalResults = processedResults;
        const finalTotal = finalResults.length;

        setStats({ total: finalTotal, valid: validCount, invalid: invalidCount });
        setEmails(finalResults);
        setIsVerifying(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsVerifying(false);
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleDownloadValid = () => {
    const validEmails = emails.filter(e => e.status === 'valid').map(e => [e.email]);
    if (validEmails.length === 0) return;

    const csv = Papa.unparse(validEmails);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'valid_emails.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center"><CheckCircle size={12} className="me-1" />Valid</span>;
      case 'invalid':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center"><XCircle size={12} className="me-1" />Invalid</span>;
      default:
        return null;
    }
  };

  const filteredEmails = activeTab === 'all' ? emails : emails.filter(e => e.status === activeTab);

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="mb-4">
        <h1 className="h2 text-dark mb-1">Email Verifier</h1>
        <p className="text-secondary text-sm">Upload a CSV file to validate email addresses.</p>
      </div>

      {/* Upload Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-5">
          <div className="border border-2 border-dashed rounded-4 p-5 text-center hover-border-primary transition-all bg-light bg-opacity-50">
            <Upload size={48} className="text-secondary opacity-50 mb-3" />
            <h4 className="fw-semibold text-dark">Upload Email List</h4>
            <p className="text-secondary small mb-4">Drop your CSV file here or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="d-none"
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary px-4 py-2">
              <FileText size={18} className="me-2" />
              Select CSV File
            </button>
            <p className="x-small text-secondary mt-3 mb-0" style={{ fontSize: '11px' }}>Supported format: CSV</p>
          </div>
        </div>
      </div>

      {/* Verification Progress */}
      {isVerifying && (
        <div className="card border-0 shadow-sm mb-4 bg-primary bg-opacity-10 border border-primary border-opacity-25">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-medium text-primary">Verifying emails...</span>
                  <span className="small fw-bold text-primary">{progress}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {emails.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Emails', value: stats.total, color: 'primary', icon: FileText },
            { label: 'Valid', value: stats.valid, color: 'success', icon: CheckCircle, sub: stats.total > 0 ? `${((stats.valid / stats.total) * 100).toFixed(1)}%` : '0%' },
            { label: 'Invalid', value: stats.invalid, color: 'danger', icon: XCircle, sub: stats.total > 0 ? `${((stats.invalid / stats.total) * 100).toFixed(1)}%` : '0%' },
          ].map((s, i) => (
            <div key={i} className="col-12 col-sm-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className={`p-2 bg-${s.color} bg-opacity-10 rounded`}>
                      <s.icon size={18} className={`text-${s.color}`} />
                    </div>
                    <span className="small text-secondary">{s.label}</span>
                  </div>
                  <div className="d-flex align-items-end gap-2">
                    <h3 className="mb-0 fw-bold">{s.value}</h3>
                    {s.sub && <span className="small text-secondary pb-1">{s.sub}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      {emails.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <h5 className="card-title fw-semibold mb-0">Verification Results</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-success" onClick={handleDownloadValid}>
                <Download size={14} className="me-1" /> Export Valid
              </button>
            </div>
          </div>
          <div className="card-body p-4 pt-2">
            <ul className="nav nav-pills bg-light p-1 rounded-3 mb-4 d-inline-flex">
              {['all', 'valid', 'invalid'].map(tab => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link rounded-3 py-1 px-3 small ${activeTab === tab ? 'active shadow-sm' : 'text-secondary'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all' ? stats.total : (tab === 'valid' ? stats.valid : stats.invalid)})
                  </button>
                </li>
              ))}
            </ul>

            <div className="table-responsive rounded border mb-0" style={{ maxHeight: '500px' }}>
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr className="small text-secondary fw-semibold">
                    <th className="ps-4">Email Address</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {filteredEmails.map((e, i) => (
                    <tr key={i}>
                      <td className="ps-4">{e.email}</td>
                      <td>{getStatusBadge(e.status)}</td>
                      <td className="text-secondary">{e.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
