const { createClient } = require('@supabase/supabase-js');
const url = 'https://jjgdatjthyeesmgunnlp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2RhdGp0aHllZXNtZ3VubmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU5NTYsImV4cCI6MjEwMDIxMTk1Nn0.iuSdvxW9VEtn_1yVLmf9ZN24CeXFxmF3aeVHEn-Dgcs';
const supabase = createClient(url, key);

async function inspectSample() {
  const { data, error } = await supabase.from('kindle_content_cache').select('topic_title, course_title, model_used, kindle_json').limit(2);
  if (error) throw error;

  console.log('--- Sample Generated Kindle Book ---');
  data.forEach((row, i) => {
    console.log(`\n[${i+1}] Topic: ${row.topic_title}`);
    console.log(`Course: ${row.course_title} | Model: ${row.model_used}`);
    console.log(`Overview: ${row.kindle_json.overview?.substring(0, 120)}...`);
    console.log(`Tamil Title: ${row.kindle_json.tamilExplanation?.simpleTitle}`);
    console.log(`Tamil Intro: ${row.kindle_json.tamilExplanation?.colloquialIntro?.substring(0, 80)}...`);
    console.log(`MCQs Count: ${row.kindle_json.mcqs?.length} | VSAQs Count: ${row.kindle_json.vsaqs?.length}`);
    console.log(`Sample MCQ: ${row.kindle_json.mcqs?.[0]?.question}`);
    console.log(`Options: ${JSON.stringify(row.kindle_json.mcqs?.[0]?.options)}`);
    console.log(`Formulas: ${JSON.stringify(row.kindle_json.formulasAndMnemonics)}`);
  });
}
inspectSample().catch(console.error);
