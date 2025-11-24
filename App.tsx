import React, { useState, useCallback } from 'react';
import { LoadingState, ProductAnalysis, GenerateAnchorsRequest } from './types';
import { generateSEOAnchors } from './services/gemini';
import { ResultCard } from './components/ResultCard';

// Preset data from the user's prompt
const PRESET_TARGET_URL = "https://www.brushapes.com/store/procreate-brushes";
const PRESET_KEYWORD = "Procreate Brushes"; 
const PRESET_PRODUCTS = [
  "https://www.brushapes.com/store/p/gouache-zen-procreate-brushes",
  "https://www.brushapes.com/store/p/pastel-dreams-procreate-brushes",
  "https://www.brushapes.com/store/p/watercolor-journeys-procreate-brushes",
  "https://www.brushapes.com/store/p/ballpoint-pen-procreate-brushes",
  "https://www.brushapes.com/store/p/procreate-craftsman-linocut-brushes",
  "https://www.brushapes.com/store/p/pencil-procreate-brushes",
  "https://www.brushapes.com/store/p/grim-shaders-procreate-brushes-starter-pack",
  "https://www.brushapes.com/store/p/manga-anime-procreate-brushes-starter-pack",
  "https://www.brushapes.com/store/p/manga-screentone-procreate-brushes",
  "https://www.brushapes.com/store/p/procreate-essential-liner-brushes",
  "https://www.brushapes.com/store/p/complete-procreate-shader-brushes-bundle"
].join('\n');

const App: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState(PRESET_TARGET_URL);
  const [targetKeyword, setTargetKeyword] = useState(PRESET_KEYWORD);
  const [productsText, setProductsText] = useState(PRESET_PRODUCTS);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [results, setResults] = useState<ProductAnalysis[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResults([]);
    
    // Validate Target URL
    if (!targetUrl || !isValidUrl(targetUrl)) {
        setErrorMsg("Please enter a valid Target Category URL (e.g., https://example.com/category).");
        setLoadingState(LoadingState.ERROR);
        return;
    }

    const productUrls = productsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (productUrls.length === 0) {
      setErrorMsg("Please enter at least one valid product URL.");
      setLoadingState(LoadingState.ERROR);
      return;
    }

    // Validate Product URLs
    const invalidUrls = productUrls.filter(url => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setErrorMsg(`Invalid product URLs found: ${invalidUrls.slice(0, 2).join(', ')}${invalidUrls.length > 2 ? '...' : ''}`);
      setLoadingState(LoadingState.ERROR);
      return;
    }

    setLoadingState(LoadingState.LOADING);

    const request: GenerateAnchorsRequest = {
      targetUrl,
      targetKeyword,
      productUrls
    };

    try {
      const analysis = await generateSEOAnchors(request);
      setResults(analysis);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      setErrorMsg("Failed to generate recommendations. Please check your API key and try again.");
      setLoadingState(LoadingState.ERROR);
    }
  }, [targetUrl, targetKeyword, productsText]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
             </svg>
             <span className="font-bold text-xl tracking-tight text-slate-900">LinkJuice AI</span>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Internal Linking Generator
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Configuration</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Category URL</label>
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm py-2 px-3 border transition-colors outline-none"
                    placeholder="https://example.com/category"
                  />
                  <p className="mt-1 text-xs text-slate-500">This is the page you want to rank higher.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Keyword</label>
                  <input
                    type="text"
                    required
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm py-2 px-3 border transition-colors outline-none"
                    placeholder="e.g. Photoshop Brushes"
                  />
                  <p className="mt-1 text-xs text-slate-500">The main search term for the category.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source Product URLs</label>
                  <textarea
                    required
                    value={productsText}
                    onChange={(e) => setProductsText(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs py-2 px-3 border font-mono h-48 transition-colors outline-none resize-none"
                    placeholder="https://example.com/product-1&#10;https://example.com/product-2"
                  />
                  <p className="mt-1 text-xs text-slate-500">One URL per line.</p>
                </div>

                <button
                  type="submit"
                  disabled={loadingState === LoadingState.LOADING}
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                    ${loadingState === LoadingState.LOADING ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 active:transform active:scale-[0.98]'}`}
                >
                  {loadingState === LoadingState.LOADING ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Optimizing for SEO...
                    </>
                  ) : (
                    'Generate SEO Anchors'
                  )}
                </button>
              </form>

              {errorMsg && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-sm flex items-start gap-2">
                   <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                   <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-8 space-y-6">
            {loadingState === LoadingState.IDLE && (
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Ready to Optimize</h3>
                  <p className="mt-2 text-slate-500 max-w-md mx-auto">
                    Enter your target category and product URLs on the left. We'll generate semantic, SEO-optimized anchor texts using Gemini 3.
                  </p>
               </div>
            )}

            {loadingState === LoadingState.LOADING && (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-slate-50 rounded w-full mb-2"></div>
                        <div className="h-4 bg-slate-50 rounded w-2/3"></div>
                     </div>
                   ))}
                </div>
            )}

            {loadingState === LoadingState.SUCCESS && (
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Recommendations</h2>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{results.length} products analyzed</span>
                 </div>
                 {results.map((item, idx) => (
                   <ResultCard key={idx} item={item} />
                 ))}
              </div>
            )}
            
            {loadingState === LoadingState.ERROR && !errorMsg && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                 <p className="text-slate-500">Something went wrong. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;