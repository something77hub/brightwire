<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg">
        <h1 class="text-3xl sm:text-4xl font-bold text-amber-950 font-display mb-2">
          Terms of Service
        </h1>
        <p class="text-amber-600 mb-8">Last updated: January 2026</p>

        <div class="prose prose-amber max-w-none space-y-8">
          <section>
            <h2 class="text-xl font-bold text-amber-900">Agreement to Terms</h2>
            <p class="text-amber-800/80">
              By accessing and using BrightWire (brightwire.news), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Nature of Service & AI Content</h2>
            <p class="text-amber-800/80">BrightWire is a positive news aggregator that uses Artificial Intelligence (AI) to curate, summarize, and rewrite news stories from various third-party sources. You understand that:</p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li>Our content is generated partially or wholly by AI technology based on public reporting</li>
              <li>We utilize state-of-the-art AI technology to curate and summarize the world's most positive news with speed and precision</li>
              <li>We transparently attribute original sources, ensuring you can always trace stories back to their origin</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Use of Our Service</h2>
            <p class="text-amber-800/80">You may use our service for personal, non-commercial purposes. You agree not to:</p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li>Reproduce, distribute, or republish our content without permission</li>
              <li>Use automated systems to scrape or download content</li>
              <li>Attempt to interfere with or disrupt our services</li>
              <li>Use our service for any illegal purpose</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Intellectual Property</h2>
            <p class="text-amber-800/80">
              The summaries, original commentary, design, and AI-generated narratives on BrightWire are protected by copyright. We respect the intellectual property of original news publishers and utilize their content under principles of fair use (commentary, transformative work, and summary).
            </p>
            <p class="text-amber-800/80 mt-2">
              If you believe any content infringes your copyright or exceeds fair use, please contact us consistently at <a href="mailto:legal@brightwire.news" class="text-amber-600 hover:underline">legal@brightwire.news</a> and we will address it immediately.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">User Submissions</h2>
            <p class="text-amber-800/80">
              When you submit a story, comment, or other content to BrightWire, you grant us a license to use, modify, and publish that content. You represent that you have the right to submit such content.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Newsletter</h2>
            <p class="text-amber-800/80">
              By subscribing to our newsletter, you agree to receive periodic emails. You can unsubscribe at any time.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Disclaimer of Warranties</h2>
            <p class="text-amber-800/80">
              BrightWire is provided "as is". We do not guarantee the accuracy, completeness, or timeliness of any content, particularly given the AI-driven nature of our processing. We are not responsible for decisions made based on our content.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Limitation of Liability</h2>
            <p class="text-amber-800/80">
              To the maximum extent permitted by law, BrightWire shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Third-Party Links</h2>
            <p class="text-amber-800/80">
              Our website may contain links to third-party websites. We are not responsible for the content or practices of these external sites. Visiting third-party links is at your own risk.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Termination</h2>
            <p class="text-amber-800/80">
              We reserve the right to terminate or suspend access to our service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Changes to Terms</h2>
            <p class="text-amber-800/80">
              We may modify these Terms at any time. Continued use of our service after changes constitutes acceptance of the new Terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Governing Law</h2>
            <p class="text-amber-800/80">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which BrightWire operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Contact Us</h2>
            <p class="text-amber-800/80">
              If you have questions about these Terms, please contact us at:
            </p>
            <p class="text-amber-800/80 mt-2">
              <strong>Email:</strong> <a href="mailto:legal@brightwire.news" class="text-amber-600 hover:underline">legal@brightwire.news</a>
            </p>
          </section>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
useHead({
  title: 'Terms of Service - BrightWire',
  meta: [
    { name: 'description', content: 'BrightWire Terms of Service - Read the terms and conditions for using our positive news service.' }
  ]
})
</script>
