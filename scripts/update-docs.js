#!/usr/bin/env node
'use strict';

/**
 * Auto-updates PROJECT_DOCS.txt after every file change.
 * Triggered by Claude Code PostToolUse hook (Write + Edit tools).
 *
 * What it updates:
 *   - Header "Last Updated" timestamp
 *   - Prepends a new changelog entry (deduplicated per file per minute)
 *   - Replaces the AUTO-GENERATED section with fresh:
 *       • All API routes   (scanned from *.routes.ts)
 *       • DB models        (scanned from schema.prisma)
 *       • Source file tree (scanned live)
 *       • Current API port / feature status
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'PROJECT_DOCS.txt');

// ─── Read hook context from stdin ─────────────────────────────────────────────
// Claude Code PostToolUse sends JSON: { tool_name, tool_input, tool_response }

let hookCtx  = {};
let rawStdin = '';
try {
  rawStdin = fs.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
  hookCtx  = JSON.parse(rawStdin);
} catch { /* stdin not available or not JSON — run unconditionally */ }

const modifiedFile =
  hookCtx?.tool_input?.file_path ??
  hookCtx?.tool_input?.new_path  ??
  '';

// Anti-loop: skip if we are modifying the docs file or this script
if (
  modifiedFile.includes('PROJECT_DOCS') ||
  modifiedFile.includes('update-docs')  ||
  modifiedFile.includes('.claude/settings')
) {
  process.exit(0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowIST() {
  return new Date().toLocaleString('en-IN', {
    timeZone:     'Asia/Kolkata',
    day:          '2-digit',
    month:        'short',
    year:         'numeric',
    hour:         '2-digit',
    minute:       '2-digit',
    hour12:       true,
  }).replace(',', ' ·');
}

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); }
  catch { return ''; }
}

function relPath(abs) {
  return abs ? abs.replace(ROOT + '/', '').replace(ROOT, '') : '(unknown)';
}

// ─── Scan API routes from *.routes.ts files ───────────────────────────────────

const MODULE_PREFIXES = {
  'auth':    '/auth',
  'product': '/products',
  'order':   '/orders',
  'payment': '/payment',
  'address': '/address',
  'support': '/support',
  'admin':   '/admin',
};

function scanRoutes() {
  const entries = [];

  function walkDir(dir) {
    let items;
    try { items = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory() && !['node_modules', '.next', 'dist'].includes(item.name)) {
        walkDir(full);
      } else if (item.name.endsWith('.routes.ts')) {
        const content = readFile(full);
        const stem    = item.name.replace('.routes.ts', '');
        const base    = MODULE_PREFIXES[stem] ?? `/${stem}`;

        for (const m of content.matchAll(/router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]/g)) {
          entries.push({
            method: m[1].toUpperCase(),
            path:   `/api/v1${base}${m[2] === '/' ? '' : m[2]}`,
          });
        }
      }
    }
  }

  walkDir(path.join(ROOT, 'backend/src'));

  return entries
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
    .map(({ method, path: p }) => `  ${method.padEnd(7)} ${p}`)
    .join('\n') || '  (no routes found)';
}

// ─── Scan Prisma schema ───────────────────────────────────────────────────────

function scanSchema() {
  const content = readFile(path.join(ROOT, 'backend/prisma/schema.prisma'));
  if (!content) return '  (schema.prisma not found)';

  const lines  = [];

  // Enums
  for (const m of content.matchAll(/^enum (\w+) \{([^}]+)\}/gm)) {
    const values = m[2].split('\n').map(l => l.trim()).filter(Boolean);
    lines.push(`  enum ${m[1]}: ${values.join(' | ')}`);
  }

  if (lines.length) lines.push('');

  // Models
  for (const m of content.matchAll(/^model (\w+) \{([^}]+)\}/gm)) {
    const modelName = m[1];
    const fields    = m[2]
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//') && !l.startsWith('@@'))
      .filter(l => {
        const parts = l.split(/\s+/);
        // Skip pure relation fields (type starts with uppercase but is a model ref)
        return parts.length >= 2;
      })
      .map(l => {
        const parts = l.split(/\s+/);
        return `    ${parts[0].padEnd(18)} ${parts.slice(1, 3).join(' ')}`;
      })
      .slice(0, 12);

    lines.push(`  model ${modelName} {`);
    lines.push(...fields);
    lines.push('  }');
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Scan source file tree ────────────────────────────────────────────────────

function scanFileTree() {
  const dirs = ['backend/src', 'frontend/src', 'admin/src'];
  const out  = [];

  for (const rel of dirs) {
    const abs = path.join(ROOT, rel);
    let files;
    try {
      files = execSync(
        `find "${abs}" -type f \\( -name "*.ts" -o -name "*.tsx" \\) | grep -v node_modules | sort`,
        { encoding: 'utf8' }
      ).trim().split('\n').filter(Boolean);
    } catch { continue; }

    out.push(`  ${rel}/ (${files.length} source files)`);
    for (const f of files.slice(0, 30)) {
      out.push(`    ${f.replace(ROOT + '/', '')}`);
    }
    if (files.length > 30) out.push(`    ... and ${files.length - 30} more`);
    out.push('');
  }

  return out.join('\n');
}

// ─── Detect feature presence from source files ────────────────────────────────

function detectFeatures() {
  const checks = [
    { flag: 'Auth (OTP + JWT)',                   file: 'backend/src/modules/auth/auth.service.ts' },
    { flag: 'Product API',                        file: 'backend/src/modules/products/product.routes.ts' },
    { flag: 'Order API',                          file: 'backend/src/modules/orders/order.routes.ts' },
    { flag: 'Order History (GET /orders/my)',      file: 'backend/src/modules/orders/order.service.ts', grep: 'getMyOrders' },
    { flag: 'Payment (Razorpay)',                  file: 'backend/src/modules/payment/payment.routes.ts' },
    { flag: 'Address management',                 file: 'backend/src/modules/address/address.routes.ts' },
    { flag: 'Admin panel (products/orders/users)', file: 'backend/src/modules/admin/admin.routes.ts' },
    { flag: 'Support ticket system',               file: 'backend/src/modules/support/support.routes.ts' },
    { flag: 'Cloudinary image upload',             file: 'backend/src/common/lib/cloudinary.ts' },
    { flag: 'Product detail page (/product/[id])', file: 'frontend/src/app/product/[id]/page.tsx' },
    { flag: 'Cart (Zustand + localStorage)',       file: 'frontend/src/store/cart.store.ts' },
    { flag: 'My Orders page',                      file: 'frontend/src/app/my-orders/page.tsx' },
    { flag: 'Order tracking UI',                   file: 'frontend/src/app/orders/[id]/page.tsx' },
    { flag: 'Support UI (/support)',               file: 'frontend/src/app/support/page.tsx' },
    { flag: 'Prisma migrations',                   file: 'backend/prisma/schema.prisma' },
  ];

  return checks
    .map(({ flag, file, grep }) => {
      const abs     = path.join(ROOT, file);
      const exists  = fs.existsSync(abs);
      const matched = grep && exists ? readFile(abs).includes(grep) : exists;
      return `  ${matched ? '✅' : '⬜'} ${flag}`;
    })
    .join('\n');
}

// ─── Changelog entry ──────────────────────────────────────────────────────────

function makeChangelogEntry() {
  const rel = relPath(modifiedFile);
  if (!rel || rel === '(unknown)') return null;
  return `  ${nowIST()}  → ${rel}`;
}

// ─── Build the full AUTO-GENERATED block ──────────────────────────────────────

const BLOCK_START = '█▓░ AUTO-GENERATED SECTION — DO NOT EDIT MANUALLY ░▓█';
const BLOCK_END   = '█▓░ END AUTO-GENERATED SECTION ░▓█';

function buildAutoBlock() {
  const lines = [
    BLOCK_START,
    `  Last synced: ${nowIST()}`,
    `  Trigger:     ${relPath(modifiedFile)}`,
    '',
    '  ── FEATURES IMPLEMENTED ──────────────────────────────────────────────────',
    detectFeatures(),
    '',
    '  ── API ROUTES (scanned from *.routes.ts) ─────────────────────────────────',
    scanRoutes(),
    '',
    '  ── DATABASE MODELS (scanned from schema.prisma) ──────────────────────────',
    scanSchema(),
    '  ── SOURCE FILE TREE ──────────────────────────────────────────────────────',
    scanFileTree(),
    BLOCK_END,
  ];
  return lines.join('\n');
}

// ─── Update PROJECT_DOCS.txt ──────────────────────────────────────────────────

let docs = readFile(DOCS);
if (!docs) {
  process.exit(0);
}

// 1. Update "Last Updated" in the header
docs = docs.replace(
  /Last Updated:.*$/m,
  `Last Updated: ${nowIST()}`
);

// 2. Prepend changelog entry (only if we know the file and it's not a dupe)
const entry = makeChangelogEntry();
if (entry) {
  const CHANGELOG_MARKER = 'CHANGELOG  (newest first)';
  const idx = docs.indexOf(CHANGELOG_MARKER);
  if (idx !== -1) {
    const insertAt = docs.indexOf('\n', idx) + 1;
    // Avoid duplicate: skip if the same file was logged in the last 2 lines
    const nextChunk = docs.slice(insertAt, insertAt + 300);
    const relFile   = relPath(modifiedFile);
    if (!nextChunk.includes(relFile)) {
      docs = docs.slice(0, insertAt) + '\n' + entry + '\n' + docs.slice(insertAt);
    }
  }
}

// 3. Replace AUTO-GENERATED block (or append if first run)
const startIdx = docs.indexOf(BLOCK_START);
const endIdx   = docs.indexOf(BLOCK_END);

if (startIdx !== -1 && endIdx !== -1) {
  // Replace existing block
  docs =
    docs.slice(0, startIdx) +
    buildAutoBlock() +
    docs.slice(endIdx + BLOCK_END.length);
} else {
  // First run: append before the final "END OF DOCUMENTATION" line
  const eof = docs.lastIndexOf('END OF DOCUMENTATION');
  if (eof !== -1) {
    const insertAt = docs.lastIndexOf('\n', eof);
    docs = docs.slice(0, insertAt) + '\n\n' + buildAutoBlock() + '\n\n' + docs.slice(insertAt + 1);
  } else {
    docs += '\n\n' + buildAutoBlock() + '\n';
  }
}

// 4. Write
fs.writeFileSync(DOCS, docs, 'utf8');
console.log(`[update-docs] Synced PROJECT_DOCS.txt — ${nowIST()}`);
