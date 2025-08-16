// frontend/src/components/SummaryDisplay.jsx
export default function SummaryDisplay({ summary, setSummary, recipientEmail, setRecipientEmail, handleShareSummary }) {
  return (
    <div className="summary-box card">
      <h2>Generated Summary <span className="editable-pill">Editable</span></h2>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={15}
      />
      <div className="share-section">
        <input
          type="email"
          placeholder="Recipient's Email Address"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
        <button onClick={handleShareSummary}>Share via Email</button>
      </div>
    </div>
  );
}