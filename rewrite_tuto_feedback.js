const fs = require('fs');
let file = 'D:/w/apps/web/src/components/teacho/TaskVideoFeedbackWebModal.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const supabase = createClient\(\);[\s\S]*?await supabase\.from\('daily_task_submissions'\)\.insert\(\{[\s\S]*?status: 'submitted'\n      \}\);/,
  `// Save submission to OCI
      const cleanPhone = userPhone.replace(/\\D/g, '').slice(-10);
      await fetch('http://152.67.7.216:8080/api/tuto/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_phone: cleanPhone,
          user_name: userName,
          course_id: courseId,
          course_title: courseTitle,
          day_number: dayNumber,
          topic_title: topicTitle,
          feedback_text: feedbackText.trim() || 'Daily task reflection submitted successfully',
          video_drive_file_id: fakeFileId,
          video_drive_link: webViewLink,
          rating,
          status: 'submitted'
        })
      });`
);

fs.writeFileSync(file, text);
console.log('Feedback modal updated.');
