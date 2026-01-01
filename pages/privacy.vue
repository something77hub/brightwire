<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg">
        <h1 class="text-3xl sm:text-4xl font-bold text-amber-950 font-display mb-2">
          Privacy Policy
        </h1>
        <p class="text-amber-600 mb-8">Last updated: December 2025</p>

        <div class="prose prose-amber max-w-none space-y-8">
          <section>
            <h2 class="text-xl font-bold text-amber-900">Introduction</h2>
            <p class="text-amber-800/80">
              BrightWire ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website brightwire.news.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Information We Collect</h2>
            
            <h3 class="text-lg font-semibold text-amber-800 mt-4">Information You Provide</h3>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li><strong>Email address</strong> — when you subscribe to our newsletter</li>
              <li><strong>Contact information</strong> — when you submit a story or contact us</li>
              <li><strong>Account information</strong> — if you create an account (optional)</li>
            </ul>

            <h3 class="text-lg font-semibold text-amber-800 mt-4">Information Collected Automatically</h3>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li><strong>Usage data</strong> — pages visited, time spent, clicks</li>
              <li><strong>Device information</strong> — browser type, operating system</li>
              <li><strong>IP address</strong> — for analytics and security purposes</li>
              <li><strong>Cookies</strong> — see our Cookie Policy for details</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">How We Use Your Information</h2>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li>To send you our newsletter (if subscribed)</li>
              <li>To respond to your inquiries and story submissions</li>
              <li>To improve our website and content</li>
              <li>To analyze usage patterns and trends</li>
              <li>To protect against fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Information Sharing</h2>
            <p class="text-amber-800/80">
              We do not sell your personal information. We may share information with:
            </p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li><strong>Service providers</strong> — who help us operate our website (hosting, analytics, email)</li>
              <li><strong>Legal requirements</strong> — when required by law or to protect our rights</li>
              <li><strong>Business transfers</strong> — in the event of a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Third-Party Services</h2>
            <p class="text-amber-800/80">We use the following third-party services:</p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li><strong>Vercel</strong> — website hosting</li>
              <li><strong>MongoDB Atlas</strong> — data storage</li>
              <li><strong>Cloudinary</strong> — image hosting and delivery</li>
              <li><strong>Google Analytics</strong> — website analytics (with your consent)</li>
              <li><strong>CookieYes</strong> — cookie consent management</li>
              <li><strong>Beehiiv</strong> — newsletter delivery</li>
              <li><strong>Formspree</strong> — contact form processing</li>
            </ul>
            <p class="text-amber-800/80 mt-2">
              Each service has its own privacy policy governing their use of your data.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Your Rights</h2>
            <p class="text-amber-800/80">You have the right to:</p>
            <ul class="list-disc pl-6 text-amber-800/80 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Unsubscribe from our newsletter at any time</li>
              <li>Opt out of analytics tracking</li>
            </ul>
            <p class="text-amber-800/80 mt-2">
              To exercise these rights, contact us at <a href="mailto:privacy@brightwire.news" class="text-amber-600 hover:underline">privacy@brightwire.news</a>.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Data Security</h2>
            <p class="text-amber-800/80">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Children's Privacy</h2>
            <p class="text-amber-800/80">
              Our website is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Changes to This Policy</h2>
            <p class="text-amber-800/80">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-amber-900">Contact Us</h2>
            <p class="text-amber-800/80">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p class="text-amber-800/80 mt-2">
              <strong>Email:</strong> <a href="mailto:privacy@brightwire.news" class="text-amber-600 hover:underline">privacy@brightwire.news</a>
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
  title: 'Privacy Policy - BrightWire',
  meta: [
    { name: 'description', content: 'BrightWire Privacy Policy - Learn how we collect, use, and protect your personal information.' }
  ]
})
</script>
