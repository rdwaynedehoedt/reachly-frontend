export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700">
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            make a purchase, or contact us for support.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, and communicate with you.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at 
            privacy@reachly.com.
          </p>
        </div>
      </div>
    </div>
  );
}
