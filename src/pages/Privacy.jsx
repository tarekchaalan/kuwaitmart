import React from "react";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose prose-slate prose-sm sm:prose-base">
      <h1><strong>Privacy Policy of KuwaitMart</strong></h1>
      <p><strong>Effective Date</strong>: {new Date().toLocaleDateString()}</p>
      <p>
        We are committed to protecting the privacy and security of our customers and
        site visitors. This Privacy Policy outlines how we collect, use, share, and safeguard
        your personal information when you visit our website (kuwaitmart.com) and use our services.
      </p>

      <h3><strong>Data Controller, DPO, and Contact</strong></h3>
      <ul>
        <li><strong>Data Controller</strong>: KuwaitMart</li>
        <li><strong>Address</strong>: Kuwait (online store)</li>
        <li><strong>Email</strong>: info@g7tc.com</li>
        <li><strong>Phone</strong>: +965 22024111</li>
      </ul>

      <h3><strong>Types of Data We Collect</strong></h3>
      <ol>
        <li><strong>Personal Identification Information</strong>: Name, email address, address, phone.</li>
        <li><strong>Account Details</strong>: Username, password (hashed), purchase history.</li>
        <li><strong>Payment Information</strong>: Processed securely by our payment provider (we do not store full card data).</li>
        <li><strong>Technical Data</strong>: IP, device/browser info, and similar analytics data.</li>
        <li><strong>Usage Data</strong>: Pages visited, items added to cart, interactions with the site.</li>
      </ol>

      <h3><strong>Why We Collect This Data</strong></h3>
      <ul>
        <li><strong>Process orders and manage your account</strong></li>
        <li><strong>Improve and personalize your shopping experience</strong></li>
        <li><strong>Communicate about products, services, and promotions (opt-in)</strong></li>
        <li><strong>Conduct market research and analysis</strong></li>
      </ul>

      <h3><strong>Legal Basis for Processing</strong></h3>
      <ol>
        <li><strong>Consent</strong> (e.g., newsletter subscription)</li>
        <li><strong>Contract</strong> (e.g., fulfilling your order)</li>
        <li><strong>Legitimate interests</strong> (e.g., improve site and offerings)</li>
        <li><strong>Legal obligations</strong> (e.g., tax and accounting)</li>
      </ol>

      <h3><strong>Data Storage, Erasure, and Security</strong></h3>
      <p>
        We store personal data only as long as needed for the purposes described above or as required by law.
        We use appropriate technical and organizational measures to protect your data (e.g., TLS encryption,
        restricted access, and secure password storage).
      </p>

      <h3><strong>Data Transfer Outside the EU</strong></h3>
      <p>
        If personal data is transferred outside your jurisdiction (e.g., to hosting or analytics providers),
        we ensure appropriate safeguards are in place (such as standard contractual clauses).
      </p>

      <h3><strong>Use of Cookies and Other Trackers</strong></h3>
      <p>
        We use cookies and similar technologies to improve your experience and analyze site usage. You can
        control cookies in your browser settings.
      </p>

      <h3><strong>Your Rights</strong></h3>
      <ul>
        <li>Access, correct, or delete your personal data</li>
        <li>Restrict or object to processing (including marketing)</li>
        <li>Data portability, where applicable</li>
      </ul>
      <p>To exercise these rights, contact us at info@g7tc.com.</p>

      <h3><strong>Contact Information</strong></h3>
      <ul>
        <li><strong>Data Controller</strong>: KuwaitMart</li>
        <li><strong>Email</strong>: info@g7tc.com</li>
        <li><strong>Phone</strong>: +965 22024111</li>
      </ul>

      <p>
        We may update this policy from time to time. Changes will be posted here with an updated effective date.
      </p>
    </div>
  );
}


