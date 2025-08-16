// frontend/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import InputSection from './components/InputSection';
import SummaryDisplay from './components/SummaryDisplay';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    if (!transcript.trim() || !prompt.trim()) {
      toast.error('Please provide both a transcript and a prompt.');
      return;
    }
    setIsLoading(true);
    setSummary('');

    const toastId = toast.loading('Generating summary...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/summary/generate`, {
        transcript,
        prompt,
      });
      setSummary(response.data.summary);
      toast.success('Summary generated successfully!', { id: toastId });
    } catch (err) {
      // --- START OF THE UPDATE ---
      // Check if the error response has the specific validation errors
      if (err.response && err.response.data && err.response.data.errors) {
        // Join all error messages into a single string
        const errorMessages = err.response.data.errors.map(e => e.msg).join('\n');
        toast.error(errorMessages, { id: toastId });
      } else {
        // Fallback for generic server or network errors
        toast.error('Failed to generate summary. Please try again.', { id: toastId });
      }
      // --- END OF THE UPDATE ---
      console.error(err);
    } finally {
      setIsLoading(false);
    }
};

  const handleShareSummary = async () => {
    if (!recipientEmail.trim() || !summary.trim()) {
      toast.error('Please enter a recipient email and generate a summary first.');
      return;
    }

    const toastId = toast.loading('Sending email...');
    try {
      // UX Improvement: Send the LATEST edited version from the state
      await axios.post(`${API_BASE_URL}/api/summary/share`, {
        recipientEmail,
        summary, // always send current edited version
      });
      toast.success(`Summary sent to ${recipientEmail}!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to send email. Please try again.', { id: toastId });
      console.error(err);
    }
  };

   return (
    <div className="app-container">
      <AnimatedBackground />
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <main>
        <InputSection
          transcript={transcript}
          setTranscript={setTranscript}
          prompt={prompt}
          setPrompt={setPrompt}
          handleGenerateSummary={handleGenerateSummary}
          isLoading={isLoading}
        />
        {summary && (
          <SummaryDisplay
            summary={summary}
            setSummary={setSummary}
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
            handleShareSummary={handleShareSummary}
          />
        )}
      </main>
    </div>
  );
}

export default App;