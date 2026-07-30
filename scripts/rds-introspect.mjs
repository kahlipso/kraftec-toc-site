// Read-only reconnaissance of the partner's AWS RDS database. Prints the SHAPE of
// the data — tables, columns, types, row counts — which is all we need to write the
// mapping layer.
//
// Run:  node --env-file=.env.local scripts/rds-introspect.mjs
//
// !! This database holds real customers' names, phone numbers, addresses, and photos
// !! of their homes. So this script prints NO row values by default. Schema output is
// !! safe to share with a collaborator; row values are not, and must not be pasted
// !! into chat tools, ticket comments, or screenshots.
//
// `--samples` prints one example row per table, with obvious PII columns masked. Use
// it only when you genuinely need to see a value's format (e.g. how a date or a
// status enum is encoded), and keep the output on your own machine.
//
// This script only ever SELECTs, and the connection is opened read-only, so it
// cannot alter their data even by mistake.

import pg from 'pg';

const missing = ['RDS_HOST', 'RDS_USER', 'RDS_PASSWORD', 'RDS_DATABASE'].filter(
  (name) => !process.env[name],
);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(', ')}`);
  process.exit(1);
}

const client = new pg.Client({
  host: process.env.RDS_HOST,
  port: Number(process.env.RDS_PORT ?? 5432),
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  ssl: process.env.RDS_CA_CERT
    ? { ca: process.env.RDS_CA_CERT }
    : { rejectUnauthorized: false },
  options: '-c default_transaction_read_only=on',
  connectionTimeoutMillis: 15_000,
});

const SHOW_SAMPLES = process.argv.includes('--samples');

// Column names that hold personal data about a real customer. Matched loosely,
// because we don't yet know the partner's naming — better to over-mask a harmless
// column than to print somebody's home address.
const PII_PATTERN =
  /name|phone|mobile|tel|email|address|addr|street|city|zip|postal|photo|image|url|lat|lng|longitude|latitude|customer|client|contact|owner|note|comment|description/i;

// Show only enough to reveal the FORMAT of a value, never its content: the type and
// the length. "a 10-char string" tells us it's a phone number; the digits don't.
function preview(column, value) {
  if (value === null) return 'NULL';
  if (PII_PATTERN.test(column)) {
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `<masked ${typeof value}, ${text.length} chars>`;
  }
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.length > 70 ? text.slice(0, 70) + '…' : text;
}

await client.connect();
console.log(`Connected to ${process.env.RDS_DATABASE} at ${process.env.RDS_HOST}\n`);

const { rows: version } = await client.query('SELECT version()');
console.log(version[0].version.split(',')[0] + '\n');

// Every non-system schema — the partner may not put things in `public`.
const { rows: tables } = await client.query(`
  SELECT table_schema, table_name
  FROM information_schema.tables
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    AND table_type = 'BASE TABLE'
  ORDER BY table_schema, table_name
`);

if (!tables.length) {
  console.log('No tables visible to this user. The credentials may be scoped to a');
  console.log('different schema, or need a GRANT from whoever sent them.');
} else {
  console.log(`${tables.length} table(s):\n`);
}

for (const { table_schema: schema, table_name: table } of tables) {
  const qualified = `"${schema}"."${table}"`;

  const { rows: columns } = await client.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schema, table],
  );

  // A table we lack SELECT rights on will throw here rather than kill the run.
  let count = null;
  let sample = null;
  try {
    count = (await client.query(`SELECT count(*)::int AS n FROM ${qualified}`)).rows[0].n;
    if (SHOW_SAMPLES) {
      sample = (await client.query(`SELECT * FROM ${qualified} LIMIT 1`)).rows[0] ?? null;
    }
  } catch (error) {
    count = `unreadable (${error.message})`;
  }

  console.log(`${'─'.repeat(70)}`);
  console.log(`${schema}.${table}  —  ${count} rows`);
  for (const c of columns) {
    const nullable = c.is_nullable === 'YES' ? '' : ' NOT NULL';
    const value = sample ? `   = ${preview(c.column_name, sample[c.column_name])}` : '';
    console.log(`  ${c.column_name.padEnd(28)} ${c.data_type}${nullable}${value}`);
  }
  console.log();
}

await client.end();
