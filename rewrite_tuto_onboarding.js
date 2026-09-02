const fs = require('fs');
let file = 'D:/w/apps/web/src/components/teacho/StudentOnboardingWebModal.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const supabase = createClient\(\);[\s\S]*?await supabase[\s\S]*?\.from\('profiles'\)[\s\S]*?\.update\(\{[\s\S]*?\}\)[\s\S]*?\.eq\('phone', cleanPhone\);/,
  `// Save to OCI
      if (cleanPhone) {
        await fetch('http://152.67.7.216:8080/api/profiles/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            full_name: fullName.trim(),
            custom_attributes: {
              academic_class: selectedClass,
              area_of_interest: selectedInterest,
              preferred_board: selectedBoard,
              target_course: selectedCourse.id
            }
          })
        });
      }`
);

fs.writeFileSync(file, text);
console.log('Onboarding modal updated.');
