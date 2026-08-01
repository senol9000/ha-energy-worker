export function renderDashboard(): Response {
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enerji Takip</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0f1117;
      --card: #1a1d27;
      --border: #2a2d3e;
      --accent: #4ade80;
      --accent-dim: #166534;
      --blue: #60a5fa;
      --text: #e2e8f0;
      --muted: #64748b;
      --red: #f87171;
      --amber: #f59e0b;
      --cyan: #22d3ee;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Segoe UI', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    header h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 2.5rem 3rem;
      width: 100%;
      max-width: 560px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }

    .icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    .value-row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 5rem;
      font-weight: 800;
      line-height: 1;
      color: var(--accent);
      transition: color 0.4s;
      letter-spacing: -2px;
    }

    .unit {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--muted);
      align-self: flex-end;
      padding-bottom: 0.5rem;
    }

    .divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 1.5rem 0;
    }

    .live-power {
      margin: 0 auto 1.25rem auto;
      border: 1px solid rgba(34, 211, 238, 0.35);
      background: rgba(34, 211, 238, 0.08);
      border-radius: 0.9rem;
      padding: 0.85rem 1rem;
      text-align: left;
    }

    .live-power-title {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--cyan);
      margin-bottom: 0.3rem;
      font-weight: 700;
    }

    .live-power-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #67e8f9;
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }

    .meta-label {
      color: var(--muted);
    }

    .meta-value {
      color: var(--text);
      font-weight: 500;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--accent-dim);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    .dot {
      width: 7px;
      height: 7px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 1.8s ease-in-out infinite;
    }

    .last-month {
      display: none;
      margin-top: 1.25rem;
      padding: 0.9rem;
      border: 1px solid rgba(245, 158, 11, 0.35);
      background: rgba(245, 158, 11, 0.12);
      border-radius: 0.9rem;
      text-align: left;
    }

    .last-month.show {
      display: block;
    }

    .last-month-title {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--amber);
      margin-bottom: 0.4rem;
      font-weight: 700;
    }

    .last-month-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fcd34d;
    }

    .last-month-date {
      margin-top: 0.2rem;
      font-size: 0.8rem;
      color: #fbbf24;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .refresh-bar {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
    }

    progress {
      width: 100%;
      height: 3px;
      border-radius: 99px;
      overflow: hidden;
      appearance: none;
      -webkit-appearance: none;
      border: none;
      background: var(--border);
    }

    progress::-webkit-progress-bar { background: var(--border); border-radius: 99px; }
    progress::-webkit-progress-value { background: var(--blue); border-radius: 99px; transition: width 1s linear; }
    progress::-moz-progress-bar { background: var(--blue); border-radius: 99px; }

    .refresh-label {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .error-msg {
      color: var(--red);
      font-size: 0.85rem;
      margin-top: 0.75rem;
      min-height: 1.2em;
    }

    @media (max-width: 520px) {
      .card { padding: 2rem 1.5rem; }
      .value { font-size: 3.75rem; }
    }
  </style>
</head>
<body>
  <header>
    <h1>⚡ Enerji Takip Paneli</h1>
  </header>

  <div class="card">
    <span class="icon">🔋</span>
    <div class="value-row">
      <span class="value" id="val">—</span>
      <span class="unit" id="unit">kWh</span>
    </div>

    <div class="live-power">
      <div class="live-power-title">Anlık Şarj Gücü</div>
      <div class="live-power-value" id="powerKw">— kW</div>
    </div>

    <hr class="divider" />

    <div class="meta">
      <div class="meta-row">
        <span class="meta-label">Son güncelleme</span>
        <span class="meta-value" id="updated">—</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Kaynak</span>
        <span class="badge"><span class="dot"></span><span id="source">—</span></span>
      </div>
    </div>

    <div id="lastMonth" class="last-month">
      <div class="last-month-title">Geçen ay kullanım</div>
      <div class="last-month-value" id="lastMonthValue">—</div>
      <div class="last-month-date" id="lastMonthDate">—</div>
    </div>

    <div class="refresh-bar">
      <progress id="prog" max="30" value="0"></progress>
      <span class="refresh-label" id="countdown">30s sonra yenileniyor</span>
    </div>
    <div class="error-msg" id="err"></div>
  </div>

  <script>
    const REFRESH_SEC = 30;
    let timer = 0;

    function fmt(iso) {
      try {
        return new Intl.DateTimeFormat('tr-TR', {
          dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Istanbul'
        }).format(new Date(iso));
      } catch { return iso; }
    }

    function setLastMonth(lastMonthUsage) {
      const box = document.getElementById('lastMonth');
      const valueEl = document.getElementById('lastMonthValue');
      const dateEl = document.getElementById('lastMonthDate');

      if (!lastMonthUsage) {
        box.classList.remove('show');
        return;
      }

      const formattedValue = Number(lastMonthUsage.energy).toLocaleString('tr-TR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      });

      valueEl.textContent = formattedValue + ' ' + (lastMonthUsage.unit || 'kWh');
      dateEl.textContent = fmt(lastMonthUsage.updated);
      box.classList.add('show');
    }

    function setLivePower(data) {
      const powerValueEl = document.getElementById('powerKw');
      const powerEntityEl = document.getElementById('powerEntity');

      if (typeof data.powerKw === 'number' && Number.isFinite(data.powerKw)) {
        powerValueEl.textContent = data.powerKw.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' kW';
      } else {
        powerValueEl.textContent = '— kW';
      }
    }

    async function load() {
      try {
        const r = await fetch('/energy');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();

        document.getElementById('val').textContent = Number(d.energy).toLocaleString('tr-TR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        });
        document.getElementById('unit').textContent = d.unit || 'kWh';
        document.getElementById('entity').textContent = d.entity;
        document.getElementById('updated').textContent = fmt(d.updated);
        document.getElementById('source').textContent = (d.source || '').replace(/_/g, ' ');

        setLivePower(d);

        if (Number(d.energy) <= 0 && d.lastMonthUsage) {
          setLastMonth(d.lastMonthUsage);
        } else {
          setLastMonth(null);
        }

        document.getElementById('err').textContent = '';
      } catch (e) {
        document.getElementById('err').textContent = 'Veri alınamadı: ' + e.message;
      }
    }

    function tick() {
      timer = (timer + 1) % (REFRESH_SEC + 1);
      document.getElementById('prog').value = timer;
      document.getElementById('countdown').textContent = (REFRESH_SEC - timer) + 's sonra yenileniyor';
      if (timer === 0) load();
    }

    load();
    setInterval(tick, 1000);
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

