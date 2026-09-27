// Floci-Aura Web Console Controller
let activeTab = 'overview';
let selectedBucket = null;
let selectedTable = null;
let selectedQueue = null;
let appState = {
  s3: { buckets: [], objects: [] },
  dynamo: { tables: [] },
  sqs: { queues: [] },
  sns: { topics: [] },
  lambda: { functions: [] },
  secrets: [],
  ssm: [],
  kms: [],
  iam: { users: [], roles: [] },
  eventBuses: [],
  logs: [],
  requests: [],
  stats: { totalRequests: 0, uptimeSeconds: 0 }
};

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupQuickAction();
  setupResetButton();
  setupGlobalFilter();
  loadData();
  setInterval(loadData, 2500); // Polling every 2.5s for live updates
});

// Setup Navigation Tabs
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  });

  const refreshBtn = document.getElementById('btnRefresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadData();
      showToast('Refreshed emulator state');
    });
  }
}

function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${tabName}`);
  });

  // Update Page Title
  const titleMap = {
    overview: { title: 'System Overview', sub: 'Real-time local cloud telemetry and resource state' },
    requests: { title: 'Live Audit Log', sub: 'Inbound AWS wire protocol dispatch logs' },
    s3: { title: 'Amazon S3 Object Storage', sub: 'Manage buckets, upload files and inspect metadata' },
    dynamodb: { title: 'Amazon DynamoDB Tables', sub: 'NoSQL tables, key schemas and item browser' },
    sqs: { title: 'Amazon SQS Message Queues', sub: 'Message delivery, visibility timeouts and polling' },
    sns: { title: 'Amazon SNS Pub/Sub', sub: 'Topic fan-out and multi-destination publishing' },
    eventbridge: { title: 'Amazon EventBridge', sub: 'Event bus routing and rule triggers' },
    lambda: { title: 'AWS Lambda Serverless', sub: 'Function registry and live test invocations' },
    secrets: { title: 'Secrets Manager & SSM', sub: 'Secure credentials and hierarchical parameters' },
    logs: { title: 'CloudWatch Logs', sub: 'Real-time structured application logs' },
    iam_kms: { title: 'Security & Identity (IAM/STS/KMS)', sub: 'Cryptographic keys, users, roles and mock caller identity' }
  };

  const info = titleMap[tabName] || { title: 'Floci-Aura Console', sub: 'Aura Lang Native Cloud Runtime' };
  document.getElementById('pageTitle').textContent = info.title;
  document.getElementById('pageSubtitle').textContent = info.sub;
}

let _prevReqCount = 0;
let _prevReqTime = Date.now();

// Fetch Full State from Server
async function loadData() {
  try {
    const res = await fetch('/_floci/api/resources');
    if (!res.ok) return;
    const data = await res.json();
    appState = data;
    renderAll();
  } catch (err) {
    console.debug('Floci-Aura poll error:', err);
  }
}

// Render Components
function renderAll() {
  renderOverviewStats();
  renderS3();
  renderDynamo();
  renderSqs();
  renderSns();
  renderLambda();
  renderSecrets();
  renderLogs();
  renderRequests();
  renderKms();
  renderIam();
  renderEventBridge();
}

function renderOverviewStats() {
  const reqCount = appState.stats?.totalRequests || 0;
  document.getElementById('statTotalReqs').textContent = reqCount.toLocaleString();
  document.getElementById('navReqCount').textContent = reqCount;
  
  const s3Count = (appState.s3?.buckets || []).length;
  const dynamoCount = (appState.dynamo?.tables || []).length;
  const sqsCount = (appState.sqs?.queues || []).length;
  const snsCount = (appState.sns?.topics || []).length;
  const lambdaCount = (appState.lambda?.functions || []).length;
  const secretsCount = (appState.secrets || []).length + (appState.ssm || []).length;
  const iamCount = (appState.iam?.users || []).length + (appState.iam?.roles || []).length;

  document.getElementById('countS3').textContent = s3Count;
  document.getElementById('navS3Count').textContent = s3Count;
  
  document.getElementById('countDynamo').textContent = dynamoCount;
  document.getElementById('navDynamoCount').textContent = dynamoCount;
  
  document.getElementById('countSqs').textContent = sqsCount;
  document.getElementById('navSqsCount').textContent = sqsCount;
  
  document.getElementById('countSns').textContent = snsCount;
  document.getElementById('navSnsCount').textContent = snsCount;
  
  document.getElementById('countLambda').textContent = lambdaCount;
  document.getElementById('navLambdaCount').textContent = lambdaCount;
  
  document.getElementById('countSecrets').textContent = secretsCount;
  document.getElementById('navSecretsCount').textContent = secretsCount;

  const navIamEl = document.getElementById('navIamCount');
  if (navIamEl) navIamEl.textContent = iamCount;

  // Real-time RPS calculation
  const now = Date.now();
  const timeDiffSec = (now - _prevReqTime) / 1000;
  if (timeDiffSec > 0.5) {
    const rps = Math.max(0, (reqCount - _prevReqCount) / timeDiffSec);
    const rpsEl = document.getElementById('statRps');
    if (rpsEl) rpsEl.textContent = `${rps.toFixed(1)} req/s`;
    _prevReqCount = reqCount;
    _prevReqTime = now;
  }

  // Compute memory footprint
  if (appState.stats?.memoryMb) {
    document.getElementById('statMemory').innerHTML = `${appState.stats.memoryMb.toFixed(1)} <small>MB</small>`;
  }
}

// S3 Rendering
function renderS3() {
  const buckets = appState.s3?.buckets || [];
  document.getElementById('s3BucketCount').textContent = buckets.length;
  const listEl = document.getElementById('s3BucketList');

  if (buckets.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No buckets found. Create one to get started!</div>';
    return;
  }

  listEl.innerHTML = buckets.map(b => `
    <div class="list-row ${selectedBucket === b.name ? 'selected' : ''}" onclick="selectBucket('${b.name}')">
      <div>
        <div class="list-row-title">🪣 ${escapeHtml(b.name)}</div>
        <div class="list-row-meta">Region: ${b.region || 'us-east-1'}</div>
      </div>
      <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="event.stopPropagation(); deleteBucket('${b.name}')">Delete</button>
    </div>
  `).join('');

  if (selectedBucket) {
    document.getElementById('selectedBucketTitle').textContent = `Bucket: s3://${selectedBucket}`;
    document.getElementById('btnUploadObject').disabled = false;
    renderBucketObjects(selectedBucket);
  }
}

function selectBucket(name) {
  selectedBucket = name;
  renderS3();
}

function renderBucketObjects(bucketName) {
  const objects = (appState.s3?.objects || []).filter(o => o.bucket === bucketName);
  const tableBody = document.getElementById('s3ObjectTableBody');

  if (objects.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-cell">Bucket is empty. Put an object to start testing!</td></tr>';
    return;
  }

  tableBody.innerHTML = objects.map(o => `
    <tr>
      <td><strong>${escapeHtml(o.key)}</strong></td>
      <td>${formatBytes(o.size)}</td>
      <td><code>${escapeHtml(o.contentType || 'application/octet-stream')}</code></td>
      <td>${o.lastModified || 'Just now'}</td>
      <td>
        <button class="btn-ghost" style="padding: 2px 6px; font-size: 0.7rem;" onclick="viewObjectContent('${o.bucket}', '${o.key}')">View</button>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.7rem;" onclick="deleteObject('${o.bucket}', '${o.key}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// DynamoDB Rendering
function renderDynamo() {
  const tables = appState.dynamo?.tables || [];
  document.getElementById('dynamoTableCount').textContent = tables.length;
  const listEl = document.getElementById('dynamoTableList');

  if (tables.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No DynamoDB tables created yet.</div>';
    return;
  }

  listEl.innerHTML = tables.map(t => `
    <div class="list-row ${selectedTable === t.name ? 'selected' : ''}" onclick="selectTable('${t.name}')">
      <div>
        <div class="list-row-title">⚡ ${escapeHtml(t.name)}</div>
        <div class="list-row-meta">Status: <span style="color:var(--color-emerald)">${t.status || 'ACTIVE'}</span> · Items: ${t.items?.length || 0}</div>
      </div>
      <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="event.stopPropagation(); deleteTable('${t.name}')">Delete</button>
    </div>
  `).join('');

  if (selectedTable) {
    document.getElementById('selectedTableTitle').textContent = `Table: ${selectedTable}`;
    document.getElementById('btnPutItem').disabled = false;
    document.getElementById('btnScanTable').disabled = false;
    renderTableItems(selectedTable);
  }
}

function selectTable(name) {
  selectedTable = name;
  renderDynamo();
}

function renderTableItems(tableName) {
  const table = (appState.dynamo?.tables || []).find(t => t.name === tableName);
  const tableBody = document.getElementById('dynamoItemsTableBody');
  const items = table?.items || [];

  if (items.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="2" class="empty-cell">Table has 0 items. Click "+ Put Item" to insert a record.</td></tr>';
    return;
  }

  tableBody.innerHTML = items.map((item, idx) => `
    <tr>
      <td><pre style="font-family:var(--font-mono);font-size:0.75rem;max-height:120px;overflow:auto;">${escapeHtml(JSON.stringify(item, null, 2))}</pre></td>
      <td>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.7rem;" onclick="deleteItem('${tableName}', ${idx})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// SQS Rendering
function renderSqs() {
  const queues = appState.sqs?.queues || [];
  document.getElementById('sqsQueueCount').textContent = queues.length;
  const listEl = document.getElementById('sqsQueueList');

  if (queues.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No SQS queues registered.</div>';
    return;
  }

  listEl.innerHTML = queues.map(q => `
    <div class="list-row ${selectedQueue === q.name ? 'selected' : ''}" onclick="selectQueue('${q.name}')">
      <div>
        <div class="list-row-title">📨 ${escapeHtml(q.name)}</div>
        <div class="list-row-meta">Messages: ${q.messages?.length || 0}</div>
      </div>
      <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="event.stopPropagation(); deleteQueue('${q.name}')">Delete</button>
    </div>
  `).join('');

  if (selectedQueue) {
    document.getElementById('selectedQueueTitle').textContent = `Queue: ${selectedQueue}`;
    document.getElementById('btnSendMessage').disabled = false;
    document.getElementById('btnPurgeQueue').disabled = false;
    renderQueueMessages(selectedQueue);
  }
}

function selectQueue(name) {
  selectedQueue = name;
  renderSqs();
}

function renderQueueMessages(queueName) {
  const queue = (appState.sqs?.queues || []).find(q => q.name === queueName);
  const tableBody = document.getElementById('sqsMessagesTableBody');
  const messages = queue?.messages || [];

  if (messages.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" class="empty-cell">Queue is empty. Send a message to inspect.</td></tr>';
    return;
  }

  tableBody.innerHTML = messages.map(m => `
    <tr>
      <td><code>${m.messageId}</code></td>
      <td><div style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(m.body)}</div></td>
      <td>${m.sentAt || 'Just now'}</td>
      <td>
        <button class="btn-ghost" style="padding: 2px 6px; font-size: 0.7rem;" onclick="alert('Message Body:\\n' + ${JSON.stringify(m.body)})">View</button>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.7rem;" onclick="deleteQueueMessage('${queueName}', '${m.receiptHandle || m.messageId}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// SNS Rendering
function renderSns() {
  const topics = appState.sns?.topics || [];
  const container = document.getElementById('snsTopicsContainer');

  if (topics.length === 0) {
    container.innerHTML = '<div class="empty-state">No SNS topics registered. Click "+ Create Topic" to get started.</div>';
    return;
  }

  container.innerHTML = topics.map(t => `
    <div class="service-card">
      <div class="service-card-header">
        <div class="service-card-title">📢 ${escapeHtml(t.name)}</div>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="deleteTopic('${t.arn}')">Delete</button>
      </div>
      <div class="service-card-meta"><code>${escapeHtml(t.arn)}</code></div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom: 0.75rem;">
        Subscriptions: <strong>${t.subscriptions?.length || 0}</strong>
      </div>
      <div class="btn-group">
        <button class="btn-secondary" style="padding: 3px 8px; font-size:0.75rem;" onclick="openPublishSnsModal('${t.arn}')">Publish Message</button>
        <button class="btn-ghost" style="padding: 3px 8px; font-size:0.75rem;" onclick="openSubscribeSnsModal('${t.arn}')">+ Subscribe</button>
      </div>
    </div>
  `).join('');
}

// Lambda Rendering
function renderLambda() {
  const functions = appState.lambda?.functions || [];
  const container = document.getElementById('lambdaFunctionsContainer');

  if (functions.length === 0) {
    container.innerHTML = '<div class="empty-state">No Lambda functions created yet. Click "+ Register Function" to add one!</div>';
    return;
  }

  container.innerHTML = functions.map(f => `
    <div class="service-card">
      <div class="service-card-header">
        <div class="service-card-title">λ ${escapeHtml(f.name)}</div>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="deleteLambda('${f.name}')">Delete</button>
      </div>
      <div class="service-card-meta">Runtime: <code>${f.runtime || 'nodejs20.x'}</code> · Handler: <code>${f.handler || 'index.handler'}</code></div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom: 0.75rem;">
        Timeout: ${f.timeout || 3}s · Memory: ${f.memorySize || 128}MB
      </div>
      <button class="btn-primary" style="padding: 4px 10px; font-size:0.75rem;" onclick="openInvokeLambdaModal('${f.name}')">▶ Invoke Function</button>
    </div>
  `).join('');
}

// Secrets & SSM Rendering
function renderSecrets() {
  const secrets = appState.secrets || [];
  document.getElementById('secretsCount').textContent = secrets.length;
  const sList = document.getElementById('secretsList');

  if (secrets.length === 0) {
    sList.innerHTML = '<div class="empty-state">No secrets registered in Secrets Manager.</div>';
  } else {
    sList.innerHTML = secrets.map(s => `
      <div class="list-row">
        <div>
          <div class="list-row-title">🔐 ${escapeHtml(s.name)}</div>
          <div class="list-row-meta">Value: <code>${escapeHtml(s.value || '******')}</code></div>
        </div>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="deleteSecret('${s.name}')">Delete</button>
      </div>
    `).join('');
  }

  const ssm = appState.ssm || [];
  document.getElementById('ssmCount').textContent = ssm.length;
  const ssmListEl = document.getElementById('ssmList');

  if (ssm.length === 0) {
    ssmListEl.innerHTML = '<div class="empty-state">No parameters in SSM Parameter Store.</div>';
  } else {
    ssmListEl.innerHTML = ssm.map(p => `
      <div class="list-row">
        <div>
          <div class="list-row-title">⚙️ ${escapeHtml(p.name)}</div>
          <div class="list-row-meta">${p.type || 'String'}: <code>${escapeHtml(p.value)}</code></div>
        </div>
        <button class="btn-ghost-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="deleteParam('${p.name}')">Delete</button>
      </div>
    `).join('');
  }
}

// CloudWatch Logs Rendering
function renderLogs() {
  const logs = appState.logs || [];
  document.getElementById('navLogsCount').textContent = logs.length;
  const contentEl = document.getElementById('logsContent');

  if (logs.length > 0) {
    contentEl.innerHTML = logs.map(l => `
      <div class="log-line ${l.level || 'info'}">
        <span style="color:var(--text-muted);font-size:0.7rem;">[${l.timestamp || '00:00:00'}]</span>
        <strong>[${escapeHtml(l.service || 'FLOCI')}]</strong> ${escapeHtml(l.message)}
      </div>
    `).join('');
  }
}

// Request Wire Log Rendering
function renderRequests() {
  const reqs = appState.requests || [];
  const tbody = document.getElementById('requestAuditTableBody');

  if (reqs.length === 0) return;

  tbody.innerHTML = reqs.slice(-50).reverse().map(r => `
    <tr>
      <td><code>${r.time || 'now'}</code></td>
      <td><span class="badge ${r.method === 'POST' ? 'aura' : 'blue'}">${r.method}</span></td>
      <td><code>${escapeHtml(r.path || '/')}</code></td>
      <td><strong>${escapeHtml(r.service || 'AWS')}</strong></td>
      <td><span style="color:${r.status < 400 ? 'var(--color-emerald)' : 'var(--color-rose)'}">${r.status}</span></td>
      <td>${r.duration || '0.2ms'}</td>
      <td><small style="color:var(--text-muted);">${escapeHtml(r.client || '127.0.0.1')}</small></td>
    </tr>
  `).join('');
}

// KMS & EventBridge Rendering
function renderKms() {
  const keys = appState.kms || [];
  document.getElementById('kmsKeyCount').textContent = keys.length;
  const listEl = document.getElementById('kmsKeysList');
  if (keys.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No KMS keys created yet.</div>';
    return;
  }
  listEl.innerHTML = keys.map(k => `
    <div class="list-row">
      <div>
        <div class="list-row-title">🔑 ${k.keyId}</div>
        <div class="list-row-meta">${escapeHtml(k.description || 'Symmetric encryption key')}</div>
      </div>
    </div>
  `).join('');
}

function renderEventBridge() {
  const buses = appState.eventBuses || [{ name: 'default', arn: 'arn:aws:events:us-east-1:000000000000:event-bus/default' }];
  document.getElementById('navEventsCount').textContent = buses.length;
  const container = document.getElementById('eventBusesContainer');
  container.innerHTML = buses.map(b => `
    <div class="service-card">
      <div class="service-card-header">
        <div class="service-card-title">⚡ ${escapeHtml(b.name)}</div>
      </div>
      <div class="service-card-meta"><code>${escapeHtml(b.arn)}</code></div>
      <button class="btn-secondary" style="padding: 3px 8px; font-size:0.75rem;" onclick="openPutEventModal('${b.name}')">Put Event</button>
    </div>
  `).join('');
}

function renderIam() {
  const users = appState.iam?.users || [];
  const roles = appState.iam?.roles || [];
  const total = users.length + roles.length;
  const countEl = document.getElementById('iamCount');
  if (countEl) countEl.textContent = total;
  const navEl = document.getElementById('navIamCount');
  if (navEl) navEl.textContent = total;

  const listEl = document.getElementById('iamList');
  if (!listEl) return;

  if (total === 0) {
    listEl.innerHTML = '<div class="empty-state">No IAM users or roles created yet.</div>';
    return;
  }

  let html = '';
  users.forEach(u => {
    html += `
      <div class="list-row">
        <div>
          <div class="list-row-title">👤 User: ${escapeHtml(u.name)}</div>
          <div class="list-row-meta"><code>${escapeHtml(u.arn)}</code></div>
        </div>
      </div>
    `;
  });
  roles.forEach(r => {
    html += `
      <div class="list-row">
        <div>
          <div class="list-row-title">🛡️ Role: ${escapeHtml(r.roleName)}</div>
          <div class="list-row-meta"><code>${escapeHtml(r.arn)}</code></div>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = html;
}

// Modal Dialog Helpers
function openModal(title, bodyHtml, onConfirm) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  const confirmBtn = document.getElementById('modalConfirmBtn');
  confirmBtn.onclick = async () => {
    await onConfirm();
    closeModal();
    loadData();
  };
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function showToast(msg) {
  const t = document.getElementById('toastNotification');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

// Modals for CRUD operations
function openCreateBucketModal() {
  openModal('Create S3 Bucket', `
    <div class="form-group">
      <label>Bucket Name</label>
      <input type="text" id="mBucketName" placeholder="e.g. my-app-assets" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mBucketName').value.trim();
    if (!name) return;
    await fetch(`/${name}`, { method: 'PUT' });
    showToast(`Bucket s3://${name} created`);
  });
}

function openPutObjectModal() {
  if (!selectedBucket) return;
  openModal(`Put Object into s3://${selectedBucket}`, `
    <div class="form-group">
      <label>Object Key (Path)</label>
      <input type="text" id="mObjKey" placeholder="e.g. configs/app.json" autofocus>
    </div>
    <div class="form-group">
      <label>Content Type</label>
      <input type="text" id="mObjContentType" value="text/plain">
    </div>
    <div class="form-group">
      <label>Body / Content</label>
      <textarea id="mObjBody" placeholder="Enter object text or JSON..."></textarea>
    </div>
  `, async () => {
    const key = document.getElementById('mObjKey').value.trim();
    const contentType = document.getElementById('mObjContentType').value.trim();
    const body = document.getElementById('mObjBody').value;
    if (!key) return;
    await fetch(`/${selectedBucket}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: body
    });
    showToast(`Object ${key} uploaded`);
  });
}

async function deleteBucket(name) {
  if (!confirm(`Delete bucket s3://${name}?`)) return;
  await fetch(`/${name}`, { method: 'DELETE' });
  if (selectedBucket === name) selectedBucket = null;
  showToast(`Bucket ${name} deleted`);
  loadData();
}

async function deleteObject(bucket, key) {
  if (!confirm(`Delete object ${key}?`)) return;
  await fetch(`/${bucket}/${key}`, { method: 'DELETE' });
  showToast(`Object ${key} deleted`);
  loadData();
}

function viewObjectContent(bucket, key) {
  window.open(`/${bucket}/${key}`, '_blank');
}

// DynamoDB Modals
function openCreateTableModal() {
  openModal('Create DynamoDB Table', `
    <div class="form-group">
      <label>Table Name</label>
      <input type="text" id="mTableName" placeholder="e.g. users" autofocus>
    </div>
    <div class="form-group">
      <label>Partition Key (PK)</label>
      <input type="text" id="mTablePK" placeholder="e.g. id" value="id">
    </div>
  `, async () => {
    const name = document.getElementById('mTableName').value.trim();
    const pk = document.getElementById('mTablePK').value.trim() || 'id';
    if (!name) return;
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'DynamoDB_20120810.CreateTable', 'Content-Type': 'application/x-amz-json-1.0' },
      body: JSON.stringify({
        TableName: name,
        KeySchema: [{ AttributeName: pk, KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: pk, AttributeType: 'S' }]
      })
    });
    showToast(`DynamoDB table '${name}' created`);
  });
}

function openPutItemModal() {
  if (!selectedTable) return;
  openModal(`Put Item into '${selectedTable}'`, `
    <div class="form-group">
      <label>Item JSON</label>
      <textarea id="mItemJson" rows="6">{ "id": { "S": "user-101" }, "name": { "S": "Alice" }, "role": { "S": "Admin" } }</textarea>
    </div>
  `, async () => {
    const raw = document.getElementById('mItemJson').value;
    try {
      const item = JSON.parse(raw);
      await fetch('/', {
        method: 'POST',
        headers: { 'x-amz-target': 'DynamoDB_20120810.PutItem', 'Content-Type': 'application/x-amz-json-1.0' },
        body: JSON.stringify({ TableName: selectedTable, Item: item })
      });
      showToast(`Item inserted into ${selectedTable}`);
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
    }
  });
}

async function deleteTable(name) {
  if (!confirm(`Delete table '${name}'?`)) return;
  await fetch('/', {
    method: 'POST',
    headers: { 'x-amz-target': 'DynamoDB_20120810.DeleteTable', 'Content-Type': 'application/x-amz-json-1.0' },
    body: JSON.stringify({ TableName: name })
  });
  if (selectedTable === name) selectedTable = null;
  showToast(`Table ${name} deleted`);
  loadData();
}

// SQS Modals
function openCreateQueueModal() {
  openModal('Create SQS Queue', `
    <div class="form-group">
      <label>Queue Name</label>
      <input type="text" id="mQueueName" placeholder="e.g. orders-processing-queue" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mQueueName').value.trim();
    if (!name) return;
    await fetch(`/?Action=CreateQueue&QueueName=${encodeURIComponent(name)}`, { method: 'POST' });
    showToast(`Queue '${name}' created`);
  });
}

function openSendMessageModal() {
  if (!selectedQueue) return;
  openModal(`Send Message to '${selectedQueue}'`, `
    <div class="form-group">
      <label>Message Body</label>
      <textarea id="mMsgBody" placeholder="Message content or JSON payload..." autofocus></textarea>
    </div>
  `, async () => {
    const body = document.getElementById('mMsgBody').value;
    const qUrl = `http://localhost:4566/000000000000/${selectedQueue}`;
    await fetch(`/?Action=SendMessage&QueueUrl=${encodeURIComponent(qUrl)}&MessageBody=${encodeURIComponent(body)}`, { method: 'POST' });
    showToast(`Message sent to ${selectedQueue}`);
  });
}

async function deleteQueue(name) {
  if (!confirm(`Delete queue '${name}'?`)) return;
  const qUrl = `http://localhost:4566/000000000000/${name}`;
  await fetch(`/?Action=DeleteQueue&QueueUrl=${encodeURIComponent(qUrl)}`, { method: 'POST' });
  if (selectedQueue === name) selectedQueue = null;
  showToast(`Queue ${name} deleted`);
  loadData();
}

async function purgeSelectedQueue() {
  if (!selectedQueue) return;
  const qUrl = `http://localhost:4566/000000000000/${selectedQueue}`;
  await fetch(`/?Action=PurgeQueue&QueueUrl=${encodeURIComponent(qUrl)}`, { method: 'POST' });
  showToast(`Queue ${selectedQueue} purged`);
  loadData();
}

// SNS Modals
function openCreateTopicModal() {
  openModal('Create SNS Topic', `
    <div class="form-group">
      <label>Topic Name</label>
      <input type="text" id="mTopicName" placeholder="e.g. user-events-topic" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mTopicName').value.trim();
    if (!name) return;
    await fetch(`/?Action=CreateTopic&Name=${encodeURIComponent(name)}`, { method: 'POST' });
    showToast(`Topic '${name}' created`);
  });
}

function openPublishSnsModal(topicArn) {
  openModal('Publish SNS Notification', `
    <div class="form-group">
      <label>Message Content</label>
      <textarea id="mSnsMsg" placeholder="Payload to broadcast to all subscribers..." autofocus></textarea>
    </div>
  `, async () => {
    const msg = document.getElementById('mSnsMsg').value;
    await fetch(`/?Action=Publish&TopicArn=${encodeURIComponent(topicArn)}&Message=${encodeURIComponent(msg)}`, { method: 'POST' });
    showToast('Published notification to topic');
  });
}

// Lambda Modals
function openCreateLambdaModal() {
  openModal('Register Lambda Function', `
    <div class="form-group">
      <label>Function Name</label>
      <input type="text" id="mLambdaName" placeholder="e.g. order-processor" autofocus>
    </div>
    <div class="form-group">
      <label>Runtime</label>
      <select id="mLambdaRuntime">
        <option value="nodejs20.x">Node.js 20.x</option>
        <option value="python3.11">Python 3.11</option>
        <option value="aura-native">Aura Lang Native</option>
      </select>
    </div>
    <div class="form-group">
      <label>Handler</label>
      <input type="text" id="mLambdaHandler" value="index.handler">
    </div>
  `, async () => {
    const name = document.getElementById('mLambdaName').value.trim();
    const runtime = document.getElementById('mLambdaRuntime').value;
    const handler = document.getElementById('mLambdaHandler').value;
    if (!name) return;
    await fetch('/2015-03-31/functions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ FunctionName: name, Runtime: runtime, Handler: handler })
    });
    showToast(`Lambda function '${name}' registered`);
  });
}

function openInvokeLambdaModal(functionName) {
  openModal(`Invoke Lambda: ${functionName}`, `
    <div class="form-group">
      <label>Payload (JSON)</label>
      <textarea id="mLambdaPayload">{ "Records": [], "key": "value" }</textarea>
    </div>
  `, async () => {
    const payload = document.getElementById('mLambdaPayload').value;
    const res = await fetch(`/2015-03-31/functions/${functionName}/invocations`, {
      method: 'POST',
      body: payload
    });
    const result = await res.text();
    alert(`Invocation Result (${res.status}):\n` + result);
  });
}

// Secrets & SSM Modals
function openCreateSecretModal() {
  openModal('Create Secret in Secrets Manager', `
    <div class="form-group">
      <label>Secret Name</label>
      <input type="text" id="mSecName" placeholder="e.g. db/production/credentials" autofocus>
    </div>
    <div class="form-group">
      <label>Secret String / Value</label>
      <textarea id="mSecVal" placeholder="secret password or json"></textarea>
    </div>
  `, async () => {
    const name = document.getElementById('mSecName').value.trim();
    const val = document.getElementById('mSecVal').value;
    if (!name) return;
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'secretsmanager.CreateSecret', 'Content-Type': 'application/x-amz-json-1.1' },
      body: JSON.stringify({ Name: name, SecretString: val })
    });
    showToast(`Secret '${name}' created`);
  });
}

function openCreateParamModal() {
  openModal('Put SSM Parameter', `
    <div class="form-group">
      <label>Parameter Name (Path)</label>
      <input type="text" id="mParamName" placeholder="e.g. /app/config/api_url" autofocus>
    </div>
    <div class="form-group">
      <label>Type</label>
      <select id="mParamType">
        <option value="String">String</option>
        <option value="SecureString">SecureString</option>
        <option value="StringList">StringList</option>
      </select>
    </div>
    <div class="form-group">
      <label>Value</label>
      <input type="text" id="mParamVal" placeholder="parameter value">
    </div>
  `, async () => {
    const name = document.getElementById('mParamName').value.trim();
    const type = document.getElementById('mParamType').value;
    const val = document.getElementById('mParamVal').value;
    if (!name) return;
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'AmazonSSM.PutParameter', 'Content-Type': 'application/x-amz-json-1.1' },
      body: JSON.stringify({ Name: name, Type: type, Value: val, Overwrite: true })
    });
    showToast(`SSM Parameter '${name}' stored`);
  });
}

// Quick Action Dispatcher
function setupQuickAction() {
  const btn = document.getElementById('btnQuickAction');
  if (btn) {
    btn.addEventListener('click', () => {
      switch (activeTab) {
        case 's3': openCreateBucketModal(); break;
        case 'dynamodb': openCreateTableModal(); break;
        case 'sqs': openCreateQueueModal(); break;
        case 'sns': openCreateTopicModal(); break;
        case 'lambda': openCreateLambdaModal(); break;
        case 'secrets': openCreateSecretModal(); break;
        case 'iam_kms': openCreateKmsKeyModal(); break;
        case 'eventbridge': openCreateBusModal(); break;
        default: openCreateBucketModal();
      }
    });
  }
}

// Reset State
function setupResetButton() {
  const btn = document.getElementById('btnResetState');
  if (btn) {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to wipe all in-memory resources?')) return;
      await fetch('/_floci/reset', { method: 'POST' });
      selectedBucket = null;
      selectedTable = null;
      selectedQueue = null;
      showToast('All emulator state wiped');
      loadData();
    });
  }
}

// Snippet Selector
const snippets = {
  cli: `export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Run commands against Floci-Aura:
aws s3 mb s3://my-local-bucket
aws dynamodb list-tables`,

  tf: `terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "mock_key"
  secret_key                  = "mock_secret"
  skip_credentials_validation = true
  skip_requesting_account_id  = true

  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    sqs      = "http://localhost:4566"
  }
}`,

  node: `import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  forcePathStyle: true,
});

const { Buckets } = await s3.send(new ListBucketsCommand({}));
console.log("Local S3 Buckets:", Buckets);`,

  python: `import boto3

s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:4566',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    region_name='us-east-1'
)

s3.create_bucket(Bucket='floci-bucket')
print("Buckets:", s3.list_buckets()['Buckets'])`
};

function setSnippet(key) {
  document.querySelectorAll('.guide-pills .pill').forEach((p, idx) => {
    const keys = ['cli', 'tf', 'node', 'python'];
    p.classList.toggle('active', keys[idx] === key);
  });
  document.getElementById('codeSnippetText').textContent = snippets[key] || '';
}

function copySnippet() {
  const code = document.getElementById('codeSnippetText').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Snippet copied to clipboard');
  });
}

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// DynamoDB Table Scan & Item Deletion
async function scanSelectedTable() {
  if (!selectedTable) return;
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: {
        'x-amz-target': 'DynamoDB_20120810.Scan',
        'Content-Type': 'application/x-amz-json-1.0'
      },
      body: JSON.stringify({ TableName: selectedTable })
    });
    const data = await res.json();
    const table = (appState.dynamo?.tables || []).find(t => t.name === selectedTable);
    if (table && data.Items) {
      table.items = data.Items;
    }
    renderTableItems(selectedTable);
    showToast(`Scanned table '${selectedTable}' (${data.Items?.length || 0} items)`);
  } catch (err) {
    console.error(err);
    showToast('Failed to scan table');
  }
}

async function deleteItem(tableName, idx) {
  if (!confirm(`Delete item #${idx + 1} from '${tableName}'?`)) return;
  const table = (appState.dynamo?.tables || []).find(t => t.name === tableName);
  const item = table?.items?.[idx];
  if (!item) return;

  const pk = table.pk || 'id';
  const keyObj = {};
  if (item[pk]) {
    keyObj[pk] = item[pk];
  } else {
    const firstKey = Object.keys(item)[0];
    keyObj[firstKey] = item[firstKey];
  }

  await fetch('/', {
    method: 'POST',
    headers: {
      'x-amz-target': 'DynamoDB_20120810.DeleteItem',
      'Content-Type': 'application/x-amz-json-1.0'
    },
    body: JSON.stringify({ TableName: tableName, Key: keyObj })
  });

  if (table.items) {
    table.items.splice(idx, 1);
  }
  renderTableItems(tableName);
  showToast(`Item deleted from '${tableName}'`);
  loadData();
}

// SQS Message Deletion
async function deleteQueueMessage(queueName, receiptHandle) {
  if (!confirm('Delete this message?')) return;
  const qUrl = `http://localhost:4566/000000000000/${queueName}`;
  await fetch(`/?Action=DeleteMessage&QueueUrl=${encodeURIComponent(qUrl)}&ReceiptHandle=${encodeURIComponent(receiptHandle)}`, {
    method: 'POST'
  });
  showToast('Message deleted from queue');
  loadData();
}

// SNS Topic Deletion & Subscriptions
async function deleteTopic(topicArn) {
  if (!confirm(`Delete topic ${topicArn}?`)) return;
  await fetch(`/?Action=DeleteTopic&TopicArn=${encodeURIComponent(topicArn)}`, { method: 'POST' });
  showToast('Topic deleted');
  loadData();
}

function openSubscribeSnsModal(topicArn) {
  const queues = appState.sqs?.queues || [];
  openModal(`Subscribe to Topic`, `
    <div class="form-group">
      <label>Topic ARN</label>
      <input type="text" value="${escapeHtml(topicArn)}" disabled>
    </div>
    <div class="form-group">
      <label>Protocol</label>
      <select id="mSubProto">
        <option value="sqs">SQS Queue</option>
        <option value="http">HTTP Webhook</option>
        <option value="email">Email</option>
      </select>
    </div>
    <div class="form-group">
      <label>Endpoint</label>
      <input type="text" id="mSubEndpoint" placeholder="http://localhost:4566/000000000000/queue-name">
      ${queues.length > 0 ? `<small style="color:var(--text-muted);display:block;margin-top:6px;">Available queues: ${queues.map(q => `<a href="javascript:void(0)" onclick="document.getElementById('mSubEndpoint').value='${q.url}'" style="color:var(--color-primary);margin-right:8px;">${q.name}</a>`).join('')}</small>` : ''}
    </div>
  `, async () => {
    const proto = document.getElementById('mSubProto').value;
    const ep = document.getElementById('mSubEndpoint').value.trim();
    if (!ep) return;
    await fetch(`/?Action=Subscribe&TopicArn=${encodeURIComponent(topicArn)}&Protocol=${encodeURIComponent(proto)}&Endpoint=${encodeURIComponent(ep)}`, { method: 'POST' });
    showToast('Subscribed to topic');
  });
}

// Lambda Function Deletion
async function deleteLambda(name) {
  if (!confirm(`Delete Lambda function '${name}'?`)) return;
  await fetch(`/2015-03-31/functions/${name}`, { method: 'DELETE' });
  showToast(`Function '${name}' deleted`);
  loadData();
}

// Secrets Manager & SSM Deletions
async function deleteSecret(name) {
  if (!confirm(`Delete secret '${name}'?`)) return;
  await fetch('/', {
    method: 'POST',
    headers: { 'x-amz-target': 'secretsmanager.DeleteSecret', 'Content-Type': 'application/x-amz-json-1.1' },
    body: JSON.stringify({ SecretId: name })
  });
  showToast(`Secret '${name}' deleted`);
  loadData();
}

async function deleteParam(name) {
  if (!confirm(`Delete parameter '${name}'?`)) return;
  await fetch('/', {
    method: 'POST',
    headers: { 'x-amz-target': 'AmazonSSM.DeleteParameter', 'Content-Type': 'application/x-amz-json-1.1' },
    body: JSON.stringify({ Name: name })
  });
  showToast(`Parameter '${name}' deleted`);
  loadData();
}

// CloudWatch Logs Control
async function refreshLogs() {
  await loadData();
  const el = document.getElementById('logsContent');
  if (el) el.scrollTop = el.scrollHeight;
  showToast('Logs refreshed');
}

function filterLogs() {
  const q = (document.getElementById('logSearchInput')?.value || '').toLowerCase();
  document.querySelectorAll('#logsContent .log-line').forEach(line => {
    const text = line.textContent.toLowerCase();
    line.style.display = text.includes(q) ? '' : 'none';
  });
}

// Request Wire Log Clear
async function clearRequestLog() {
  await fetch('/_floci/clear-requests', { method: 'POST' });
  appState.requests = [];
  const tbody = document.getElementById('requestAuditTableBody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Waiting for incoming AWS requests...</td></tr>';
  }
  showToast('Request audit log cleared');
}

// KMS Modals
function openCreateKmsKeyModal() {
  openModal('Create KMS Symmetric Key', `
    <div class="form-group">
      <label>Key Description</label>
      <input type="text" id="mKmsDesc" placeholder="e.g. Master App Encryption Key" autofocus>
    </div>
  `, async () => {
    const desc = document.getElementById('mKmsDesc').value.trim() || 'Master Key';
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'TrentService.CreateKey', 'Content-Type': 'application/x-amz-json-1.1' },
      body: JSON.stringify({ Description: desc })
    });
    showToast('KMS Key created');
  });
}

// IAM Modals
function openCreateIamUserModal() {
  openModal('Create IAM User', `
    <div class="form-group">
      <label>User Name</label>
      <input type="text" id="mIamUserName" placeholder="e.g. deployer-bot" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mIamUserName').value.trim();
    if (!name) return;
    await fetch(`/?Action=CreateUser&UserName=${encodeURIComponent(name)}`, { method: 'POST' });
    showToast(`IAM user '${name}' created`);
  });
}

function openCreateIamRoleModal() {
  openModal('Create IAM Role', `
    <div class="form-group">
      <label>Role Name</label>
      <input type="text" id="mIamRoleName" placeholder="e.g. LambdaExecutionRole" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mIamRoleName').value.trim();
    if (!name) return;
    await fetch(`/?Action=CreateRole&RoleName=${encodeURIComponent(name)}`, { method: 'POST' });
    showToast(`IAM role '${name}' created`);
  });
}

// EventBridge Modals
function openCreateBusModal() {
  openModal('Create EventBridge Event Bus', `
    <div class="form-group">
      <label>Event Bus Name</label>
      <input type="text" id="mBusName" placeholder="e.g. orders-event-bus" autofocus>
    </div>
  `, async () => {
    const name = document.getElementById('mBusName').value.trim();
    if (!name) return;
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'AWSEvents.CreateEventBus', 'Content-Type': 'application/x-amz-json-1.1' },
      body: JSON.stringify({ Name: name })
    });
    showToast(`Event bus '${name}' created`);
  });
}

function openPutEventModal(busName) {
  openModal(`Put Event to Bus: ${busName}`, `
    <div class="form-group">
      <label>Event Source</label>
      <input type="text" id="mEvSource" placeholder="e.g. ecommerce.orders" value="my.app" autofocus>
    </div>
    <div class="form-group">
      <label>Detail Type</label>
      <input type="text" id="mEvDetailType" placeholder="e.g. OrderCreated" value="AppEvent">
    </div>
    <div class="form-group">
      <label>Detail (JSON)</label>
      <textarea id="mEvDetail">{ "id": 1001, "status": "CONFIRMED" }</textarea>
    </div>
  `, async () => {
    const source = document.getElementById('mEvSource').value.trim() || 'my.app';
    const detailType = document.getElementById('mEvDetailType').value.trim() || 'AppEvent';
    const detail = document.getElementById('mEvDetail').value.trim() || '{}';
    await fetch('/', {
      method: 'POST',
      headers: { 'x-amz-target': 'AWSEvents.PutEvents', 'Content-Type': 'application/x-amz-json-1.1' },
      body: JSON.stringify({
        Entries: [{
          EventBusName: busName,
          Source: source,
          DetailType: detailType,
          Detail: detail
        }]
      })
    });
    showToast('Dispatched event to EventBridge');
  });
}

// Global Search Filter
function setupGlobalFilter() {
  const input = document.getElementById('globalFilter');
  if (!input) return;
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    applyGlobalFilter(query);
  });
}

function applyGlobalFilter(query) {
  // S3
  document.querySelectorAll('#s3BucketList .list-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // DynamoDB
  document.querySelectorAll('#dynamoTableList .list-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // SQS
  document.querySelectorAll('#sqsQueueList .list-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // SNS
  document.querySelectorAll('#snsTopicsContainer .service-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // Lambda
  document.querySelectorAll('#lambdaFunctionsContainer .service-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // Secrets & SSM
  document.querySelectorAll('#secretsList .list-row, #ssmList .list-row').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // EventBridge
  document.querySelectorAll('#eventBusesContainer .service-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
  // Audit log
  document.querySelectorAll('#requestAuditTableBody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
}
