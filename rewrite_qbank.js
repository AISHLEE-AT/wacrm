const fs = require('fs');
let file = 'D:/w/apps/web/src/lib/qbankTaxonomyEngine.ts';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /export async function querySupabaseQuestionBank\([\s\S]*?return results;\n\}/,
  `export async function querySupabaseQuestionBank(
    query: string = '',
    filterSubjectCode: string = 'ALL',
    filterDifficulty: string = 'ALL',
    rangeOptions?: SearchRangeOptions
  ): Promise<StructuredMCQ[]> {
    try {
      const url = new URL('http://152.67.7.216:8080/api/qbank/search');
      url.searchParams.append('query', query);
      url.searchParams.append('subject', filterSubjectCode);
      url.searchParams.append('difficulty', filterDifficulty);
      const res = await fetch(url.toString());
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }`
);

fs.writeFileSync(file, text);
console.log('QBank engine updated.');
