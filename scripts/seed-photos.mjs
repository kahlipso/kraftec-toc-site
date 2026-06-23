// One-off helper: uploads YOUR local images to Vercel Blob and saves their URLs
// into the work_orders.photos column.
//
// Put images in folders named by work-order id:
//   scripts/sample-photos/KR-2049/before.jpg, after.jpg, ...
//
// Then run:  node --env-file=.env.local scripts/seed-photos.mjs
//
// For each order it: reads the image files → uploads each to Blob → collects the
// returned public URLs → saves that list into the photos column. This is the exact
// pipeline the future admin upload form will use (receive a file → put() → store URL).

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const PHOTOS_DIR = 'scripts/sample-photos';
const orderIds = ['KR-2049', 'KR-1847', 'KR-1923', 'KR-1981'];

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

for (const id of orderIds) {
  const dir = join(PHOTOS_DIR, id);

  // Find the image files in this order's folder (skip the order if none).
  let files;
  try {
    files = (await readdir(dir))
      .filter((f) => CONTENT_TYPES[extname(f).toLowerCase()])
      .sort();
  } catch {
    console.log(`– skip ${id}: no folder at ${dir}`);
    continue;
  }
  if (files.length === 0) {
    console.log(`– skip ${id}: no images in ${dir}`);
    continue;
  }

  // Upload each file to Blob and collect the public URLs.
  const urls = [];
  for (const file of files) {
    const bytes = await readFile(join(dir, file));
    const blob = await put(`work-orders/${id}/${file}`, bytes, {
      access: 'public',
      addRandomSuffix: true,
      contentType: CONTENT_TYPES[extname(file).toLowerCase()],
    });
    urls.push(blob.url);
    console.log(`  uploaded ${id}/${file}`);
  }

  // Save the URL list into the jsonb photos column (cast text → jsonb).
  await sql`UPDATE work_orders SET photos = ${JSON.stringify(urls)}::jsonb WHERE id = ${id}`;
  console.log(`✓ ${id}: saved ${urls.length} photo URLs to the database`);
}

console.log('Done seeding photos.');
