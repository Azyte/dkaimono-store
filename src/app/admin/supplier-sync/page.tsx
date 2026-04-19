'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SupplierSyncPage() {
  const [supplier, setSupplier] = useState('digiflazz');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    // MOCK: In a real environment, this calls the backend API which fetches from Supplier
    setTimeout(() => {
      setSyncResult({
        success: true,
        message: 'Sync completed',
        data: {
          games_added: 42,
          games_updated: 8,
          products_mapped: 1205,
          timestamp: new Date().toISOString()
        }
      });
      setIsSyncing(false);
    }, 2500);
  };

  const handleLoadMaster = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncResult({
        success: true,
        message: 'Master Catalog Loaded',
        data: {
          games_added: 50,
          status: 'Ready for Supplier Product Mapping'
        }
      });
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Supplier Host-to-Host (H2H) Sync</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* API Config Card */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Supplier Configuration</h2>
          <div className="form-group">
            <label className="form-label">H2H Supplier</label>
            <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="digiflazz">Digiflazz API</option>
              <option value="vipreseller">VIP Reseller</option>
              <option value="apigames">ApiGames</option>
              <option value="vocagame">VocaGame</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Supplier Username / Client ID</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. digi_reseller123" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Production API Key</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="dev-xxxxx OR prod-xxxxx" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Keys are stored securely in backend environments. Never share your Production Keys.
          </p>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={handleSync}
            disabled={isSyncing || (!apiKey && !username)}
          >
            {isSyncing ? 'Synchronizing...' : `Pull Products from ${supplier.toUpperCase()}`}
          </button>
        </div>

        {/* Catalog Control Card */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Game Catalog Management</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Initialize your database with Premium White-Label game designs (Icons & Banners HD). This avoids manual data entry.
          </p>
          
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 16 }} onClick={handleLoadMaster} disabled={isSyncing}>
            🔄 Load Master HD Catalog (50+ Games)
          </button>

          {syncResult && (
            <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: syncResult.success ? 'var(--color-success)' : 'var(--color-error)', marginBottom: 8 }}>
                {syncResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <p style={{ fontWeight: 'bold' }}>{syncResult.message}</p>
              <pre style={{ marginTop: 12, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(syncResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
