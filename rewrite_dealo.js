const fs = require('fs');
const file = 'D:/w/apps/web/src/app/(dashboard)/dealo/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace fetchListings
content = content.replace(
  /const { data, error } = await supabase[\s\S]*?\.from\('market_listings'\)[\s\S]*?\.order\('created_at', { ascending: false }\);/,
  `const res = await fetch('http://152.67.7.216:8080/api/dealo/listings');
      const data = res.ok ? await res.json() : null;
      const error = res.ok ? null : new Error('Failed to fetch listings');`
);

// Replace insert
content = content.replace(
  /const { data, error } = await supabase\.from\('market_listings'\)\.insert\(\[newListing\]\)\.select\(\)\.single\(\);/,
  `const res = await fetch('http://152.67.7.216:8080/api/dealo/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      const data = res.ok ? await res.json() : null;
      const error = res.ok ? null : new Error('Failed to create listing');`
);

// Replace mark as sold
content = content.replace(
  /await supabase\.from\('market_listings'\)\.update\({ status: 'sold' }\)\.eq\('id', id\);/,
  `await fetch('http://152.67.7.216:8080/api/dealo/listings/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' })
      });`
);

// Replace realtime channel with simple reload
content = content.replace(
  /const channel = supabase[\s\S]*?supabase\.removeChannel\(channel\);/m,
  `const interval = setInterval(() => fetchListings(), 10000);
    return () => clearInterval(interval);`
);

// Second pass if the first replace for channel failed (due to multi-line matching)
if (content.includes('supabase.channel')) {
  content = content.replace(/const channel = supabase[\s\S]*?return \(\) => {[\s\S]*?supabase\.removeChannel\(channel\);[\s\S]*?};/, 
  `const interval = setInterval(() => fetchListings(), 10000);
    return () => clearInterval(interval);`);
}

fs.writeFileSync(file, content);
console.log('DealO page updated successfully!');
