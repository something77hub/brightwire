const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'index.vue');

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Replace Trending Now section with Joke of the Day (lines ~161-180)
const trendingSection = content.match(/<!-- Trending Topics -->[\s\S]*?<\/div>\s*<\/div>\s*\n\s*<!-- Categories/)[0];
const jokeSection = `<!-- Joke of the Day -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-lg border border-amber-200/50">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">&#128516;</span>
                <h3 class="font-bold text-amber-950">Joke of the Day</h3>
              </div>
              <div class="space-y-3">
                <p class="text-amber-900 text-sm leading-relaxed italic">"{{ siteSettings?.jokeText || "Why don't scientists trust atoms? Because they make up everything!" }}"</p>
                <button 
                  @click="shareJoke"
                  class="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share this laugh
                </button>
              </div>
            </div>

            <!-- Categories`;

content = content.replace(trendingSection, jokeSection);

// Fix 2: Replace RSS Feed section with Quote of the Day
const rssSection = content.match(/<!-- RSS Feed -->[\s\S]*?<\/div>\s*<\/div>\s*\n\s*<\/aside>/)[0];
const quoteSection = `<!-- Quote of the Day -->
            <div class="bg-white rounded-2xl p-5 shadow-lg border border-amber-100">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <h3 class="font-bold text-amber-950">Quote of the Day</h3>
              </div>
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500">
                <p class="text-amber-900 text-sm leading-relaxed mb-2">"{{ siteSettings?.quoteText || "The only way to do great work is to love what you do." }}"</p>
                <p class="text-xs text-amber-600 font-medium">&mdash; {{ siteSettings?.quoteAuthor || "Steve Jobs" }}</p>
              </div>
            </div>
          </aside>`;

content = content.replace(rssSection, quoteSection);

// Fix 3: Add shareJoke function before formatCategoryTitle
const targetFunction = 'function formatCategoryTitle(category: string): string {';
const shareJokeFunction = `const shareJoke = () => {
  const joke = siteSettings.value?.jokeText || "Why don't scientists trust atoms? Because they make up everything!"
  const text = \`\${joke}\\n\\n😄 Daily good news at BrightWire\`
  
  if (navigator.share) {
    navigator.share({
      title: 'Joke of the Day',
      text,
      url: 'https://brightwire.news'
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Joke copied to clipboard! 📋')
    })
  }
}

`;

content = content.replace(targetFunction, shareJokeFunction + targetFunction);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed pages/index.vue successfully!');
