<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg">
        <h1 class="text-3xl sm:text-4xl font-bold text-amber-950 font-display mb-2">
          Terms of Service
        </h1>
        <p class="text-amber-600 mb-8">Last updated: December 2025</p>

        <div class="prose prose-amber max-w-none space-y-8">
          <section>
            <h2 class="text-xl font-bold text-amber-900">Agreement to Terms</h2>
            <p class="text-amber-800/80">
              By accessing and using BrightWire (brightwire.news), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Use of Our Service</h2>
            <p class="text-amber-800/80">BrightWire provides a positive news aggregation service. You may use our service for personal, non-commercial purposes. You agree not to:</p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li>Reproduce, distribute, or republish our content without permission</li>
              <li>Use automated systems to scrape or download content</li>
              <li>Attempt to interfere with or disrupt our services</li>
              <li>Use our service for any illegal purpose</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Content and Copyright</h2>
            <p class="text-amber-800/80">
              All content on BrightWire, including articles, images, graphics, and design, is protected by copyright and other intellectual property laws. Our articles are original editorial content created by our team.
            </p>
            <p class="text-amber-800/80 mt-2">
              We attribute original reporting to the source publication. If you believe any content infringes your copyright, please contact us at <a href="mailto:legal@brightwire.news" class="text-amber-600 hover:underline">legal@brightwire.news</a>.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">User Submissions</h2>
            <p class="text-amber-800/80">
              When you submit a story, comment, or other content to BrightWire, you grant us a non-exclusive, royalty-free license to use, modify, and publish that content. You represent that you have the right to submit such content and that it does not violate any laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Newsletter</h2>
            <p class="text-amber-800/80">
              By subscribing to our newsletter, you agree to receive periodic emails from us. You can unsubscribe at any time by clicking the unsubscribe link in any email or by contacting us.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Disclaimer</h2>
            <p class="text-amber-800/80">
              BrightWire is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any content. We are not responsible for decisions made based on our content.
            </p>
            <p class="text-amber-800/80 mt-2">
              While we strive to feature positive and accurate news, we cannot verify every claim in every story. We encourage readers to consult multiple sources for important decisions.
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
