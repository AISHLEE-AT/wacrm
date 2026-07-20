export const youtubeService = {
  async searchTopVideo(courseTitle, topicTitle) {
    // Try env first, fallback to hardcoded key provided by user since it's not on Vercel yet
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyCgtQFDzKsBjwJPzWtw5jq3x-Nia_00I6Q";
    if (!apiKey) {
      console.warn('YouTube API Key is missing.');
      return '';
    }

    // Clean up the topic title (e.g. remove "Topic 1.1: ")
    const cleanTopic = topicTitle.replace(/^(Topic|Module)\s*\d+(\.\d+)?\s*[:-]?\s*/i, '').trim();
    const cleanCourse = courseTitle.split('-')[0].trim(); // Shorten course title
    const query = encodeURIComponent(`${cleanCourse} ${cleanTopic} tutorial`);
    
    try {
      // First try to find a long-form video (usually > 20 mins)
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&order=viewCount&videoDuration=long&maxResults=1&key=${apiKey}`;
      let response = await fetch(url);
      let data = await response.json();

      // If no long videos found, fallback to any duration
      if (!data.items || data.items.length === 0) {
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&order=viewCount&maxResults=1&key=${apiKey}`;
        response = await fetch(url);
        data = await response.json();
      }
      
      // If still nothing, try just the topic name (broadest search)
      if (!data.items || data.items.length === 0) {
        const broadQuery = encodeURIComponent(`${cleanTopic} tutorial`);
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${broadQuery}&type=video&order=viewCount&maxResults=1&key=${apiKey}`;
        response = await fetch(url);
        data = await response.json();
      }

      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      
      return '';
    } catch (err) {
      console.error('Failed to search YouTube video:', err);
      return '';
    }
  },

  async searchMultipleVideos(courseTitle, topicTitle, markdownContent = '') {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "AIzaSyCgtQFDzKsBjwJPzWtw5jq3x-Nia_00I6Q";
    if (!apiKey) return '';

    const cleanTopic = topicTitle.replace(/^(Topic|Module)\s*\d+(\.\d+)?\s*[:-]?\s*/i, '').trim();
    const cleanCourse = courseTitle.split('-')[0].trim();
    
    // 1. Gather queries based on markdown content subtopics
    let queries = [`${cleanCourse} ${cleanTopic} tutorial`];
    
    if (markdownContent) {
      // Look for lines starting with ## or ### (Markdown headings)
      const headingRegex = /^(?:#{2,3})\s+(.+)$/gm;
      let match;
      const subtopics = [];
      while ((match = headingRegex.exec(markdownContent)) !== null) {
        const text = match[1].trim();
        if (text.toLowerCase() !== 'references & further learning' && text.toLowerCase() !== 'key takeaways') {
          subtopics.push(text);
        }
      }
      
      // Take up to 2 distinct subtopics
      for (let i = 0; i < Math.min(2, subtopics.length); i++) {
         queries.push(`${cleanCourse} ${subtopics[i]} tutorial`);
      }
    }

    const videoUrls = [];
    
    // 2. Fetch a video for each query
    for (const q of queries) {
      try {
        const encQuery = encodeURIComponent(q);
        // Request long videos first
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encQuery}&type=video&order=viewCount&videoDuration=long&maxResults=1&key=${apiKey}`;
        let response = await fetch(url);
        let data = await response.json();
        
        // Fallback to any duration
        if (!data.items || data.items.length === 0) {
          url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encQuery}&type=video&order=viewCount&maxResults=1&key=${apiKey}`;
          response = await fetch(url);
          data = await response.json();
        }
        
        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId;
          const urlStr = `https://www.youtube.com/watch?v=${videoId}`;
          // Ensure we don't add duplicates
          if (!videoUrls.includes(urlStr)) {
            videoUrls.push(urlStr);
          }
        }
      } catch (err) {
        console.error('Failed to fetch video for query:', q, err);
      }
    }

    return videoUrls.join(',');
  }
};
