import React, { useState } from 'react';

export default function App() {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleScrape = async () => {
    setImageUrls([]);
    setError('');
    setIsLoading(true);

    const backendApiUrl = 'http://127.0.0.1:5000/scrape';

    try {
      const response = await fetch(backendApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Status: ${response.status}`);
      }
      
      setImageUrls(result.image_urls || []);

    } catch (err) {
      console.error("API call failed:", err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Scraper</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Enter a website URL.
      </p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ flexGrow: 1, padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={handleScrape} 
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            cursor: 'pointer',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {isLoading ? 'Scraping...' : 'Scrape Images'}
        </button>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      {imageUrls.length > 0 && <h2>Found {imageUrls.length} images:</h2>}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '15px',
        marginTop: '10px'
      }}>
        {imageUrls.map((url, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>
            <img 
              src={url} 
              alt={`Scraped image ${index + 1}`} 
              style={{ 
                width: '100%', 
                height: '150px', 
                objectFit: 'cover', 
                display: 'block' 
              }}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                fontSize: '12px', 
                wordWrap: 'break-word', 
                color: '#007bff' 
              }}
            >
              Source
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
