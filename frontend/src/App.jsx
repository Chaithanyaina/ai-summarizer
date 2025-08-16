// frontend/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Header from './components/Header';
import InputSection from './components/InputSection';
import SummaryDisplay from './components/SummaryDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const ctrl = useRef(new AbortController());
  const summaryRef = useRef(null);

  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/summary/history`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        toast.error('Could not load summary history.');
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerateSummary = async () => {
    if (!transcript.trim() || !prompt.trim()) {
      toast.error('Please provide both a transcript and a prompt.');
      return;
    }
    setIsLoading(true);
    setSummary(''); // Clear previous summary to ensure view switch
    ctrl.current = new AbortController();

    await fetchEventSource(`${API_BASE_URL}/api/summary/generate-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, prompt }),
      signal: ctrl.current.signal,
      onmessage(event) {
        const data = JSON.parse(event.data);
        if (data.event === 'done') {
          setIsLoading(false);
          toast.success('Summary generated!');
          ctrl.current.abort();
          // Scroll after a short delay to allow the DOM to update
          setTimeout(() => {
            summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
          axios.get(`${API_BASE_URL}/api/summary/history`).then(res => setHistory(res.data));
        } else {
          setSummary((prev) => prev + data.chunk);
        }
      },
      onerror(err) {
        toast.error('Connection error or summary generation failed.');
        setIsLoading(false);
        ctrl.current.abort();
        throw err;
      },
    });
  };

  const handleShareSummary = async () => {
    if (!recipientEmail.trim() || !summary.trim()) {
      toast.error('Please enter a recipient email and generate a summary first.');
      return;
    }
    const toastId = toast.loading('Sending email...');
    try {
      await axios.post(`${API_BASE_URL}/api/summary/share`, { recipientEmail, summary });
      toast.success(`Summary sent to ${recipientEmail}!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to send email. Please try again.', { id: toastId });
      console.error(err);
    }
  };

  const loadFromHistory = (item) => {
    setPrompt(item.prompt);
    setSummary(item.summary); // This will switch the view to the summary display
    toast.success('Loaded from history!');
  };
  
  const handleGoBack = () => {
    setSummary('');
    setRecipientEmail('');
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      
      {!summary ? (
        // --- MAIN VIEW ---
        <main className="main-view-layout">
          <div className="content-column">
            <InputSection
              transcript={transcript}
              setTranscript={setTranscript}
              prompt={prompt}
              setPrompt={setPrompt}
              handleGenerateSummary={handleGenerateSummary}
              isLoading={isLoading}
            />
          </div>
          <aside className="history-column">
            <div className="history-card">
              <h3>Summary History</h3>
              <div className="history-list">
                {isHistoryLoading ? ( <p>Loading...</p> ) 
                : history.length === 0 ? ( <p>No summaries yet.</p> ) 
                : (
                  history.slice(0, 3).map((item) => ( // Show only the last 3
                    <div key={item._id} className="history-item" onClick={() => loadFromHistory(item)}>
                      <p className="history-prompt">{item.prompt}</p>
                      <p className="history-summary-preview">{item.summary.substring(0, 80)}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </main>
      ) : (
        // --- SUMMARY VIEW ---
        <div ref={summaryRef} className="summary-view-container">
          <button onClick={handleGoBack} className="back-button">← Back to Summarizer</button>
          <SummaryDisplay
            summary={summary}
            setSummary={setSummary}
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
            handleShareSummary={handleShareSummary}
          />
        </div>
      )}
    </div>
  );
}

export default App;