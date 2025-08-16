// frontend/src/components/InputSection.jsx
export default function InputSection({ transcript, setTranscript, prompt, setPrompt, handleGenerateSummary, isLoading }) {
  const quickActions = [
    { label: 'Summarize in 5 Bullets', query: 'Summarize this meeting in 5 concise bullet points, focusing on the main outcomes.' },
    { label: 'Highlight Action Items', query: 'Extract all action items from this transcript. List each item with the assigned person if mentioned.' },
    { label: 'Create Executive Summary', query: 'Provide a short, high-level executive summary of the meeting suitable for leadership.' },
    { label: 'Extract Risks & Blockers', query: 'Identify and list any potential risks, blockers, or concerns raised during the meeting.' },
  ];

  return (
    <div className="input-section card">
      <textarea
        placeholder="Paste your meeting transcript here..."
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={10}
      />
      <div className="quick-actions">
        {quickActions.map((action) => (
          <button key={action.label} className="quick-action-btn" onClick={() => setPrompt(action.query)}>
            {action.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Ask something… e.g., Summarize in bullets, Highlight action items"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="generate-btn" onClick={handleGenerateSummary} disabled={isLoading}>
        {isLoading ? 'Generating...' : '✨ Generate Summary'}
      </button>
    </div>
  );
}