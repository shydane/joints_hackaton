import React, { useState } from 'react';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:20128/v1',
  apiKey: '', // Sesuaikan dengan API Key 9Router kamu jika butuh
  dangerouslyAllowBrowser: true
});

export default function App() {
  const [count, setCount] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    
    try {
      const completion = await client.chat.completions.create({
        model: 'hackathon',
        messages: [{ role: 'user', content: prompt }],
      });

      const reply = completion.choices[0]?.message?.content;
      if (reply && reply.trim() !== '') {
        setResponse(reply);
      } else {
        setResponse('AI memberikan respon kosong. Coba klik Kirim sekali lagi.');
      }
    } catch (error) {
      console.error('Error memanggil AI:', error);
      setResponse('Gagal mengambil respon dari AI: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Project JOIN + 9Router AI</h1>
      <p style={{ color: '#94a3b8' }}>Menggunakan Combo: <strong>hackathon</strong></p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Count is {count}
        </button>
      </div>

      <hr style={{ borderColor: '#334155', margin: '30px 0' }} />

      <h3>Tanya AI (9Router):</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
        <textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ketik pertanyaan atau instruksi koding di sini..."
          style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '6px' }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: '10px 20px', background: loading ? '#475569' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Sedang Diproses...' : 'Kirim ke AI'}
        </button>
      </div>

      <h3 style={{ marginTop: '30px' }}>Respon AI:</h3>
      <div style={{ padding: '15px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', minHeight: '80px', maxWidth: '600px', whiteSpace: 'pre-wrap' }}>
        {response || 'Belum ada respon.'}
      </div>
    </div>
  );
}
