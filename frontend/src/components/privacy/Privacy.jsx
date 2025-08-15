export default function Privacy() {
  return (
    <div className="container-app py-8">
      <div className="card">
        <div className="card-body">
          <h1 className="h1 mb-2">Privacy Notice</h1>
          <p><strong>Effective Date:</strong> 19 June 2025</p>
          <p>This Privacy Notice applies to the use of the XLedger Client Invoice Portal.</p>

          <h2 className="h2 mt-6">1. Who We Are</h2>
          <p>
            This portal is operated by <strong>XLedger Ltd</strong>, a service provider offering invoice and
            legal services tracking tools for law firms.
          </p>
          <p>
            <strong>Platform Operator (Data Processor):</strong><br />
            XLedger Ltd<br />
            Registered in England and Wales<br />
            Contact: <a href="mailto:privacy@xledger.co.uk">privacy@xledger.co.uk</a>
          </p>
          <p>
            <strong>Law Firm (Data Controller):</strong><br />
            [Law Firm Name]<br />
            Lawyer: Jane Smith<br />
            Contact: lawfirm@domain.co.uk
          </p>

          <h2 className="h2 mt-6">2. What Information We Collect</h2>
          <ul className="list-disc pl-6">
            <li>Client names and contact details</li>
            <li>Invoice numbers, service details, and costs</li>
            <li>Payment information (for processing only)</li>
            <li>Login credentials (usernames, encrypted passwords)</li>
            <li>Access logs, IP address, and browser metadata</li>
          </ul>

          <h2 className="h2 mt-6">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6">
            <li>To display invoices for legal services</li>
            <li>To process payments securely</li>
            <li>To maintain client records in compliance with regulations</li>
            <li>To protect portal security and integrity</li>
          </ul>

          <h2 className="h2 mt-6">4. Payment Data &amp; PCI-DSS Compliance</h2>
          <p>
            Payments through this portal are processed by third-party, PCI-DSS compliant payment
            gateways (e.g., Stripe). XLedger does <strong>not store</strong> full card numbers or CVV codes.
          </p>
          <p>
            Payment data is encrypted and transmitted securely via SSL/TLS to the processor. Only
            transaction status (success/failure) is retained by us for record purposes.
          </p>

          <h2 className="h2 mt-6">5. User Account and Password Security</h2>
          <p>
            Registered users must use secure passwords. All passwords are hashed and encrypted. We
            recommend not sharing login credentials. Suspicious activity may result in temporary lockout.
          </p>

          <h2 className="h2 mt-6">6. Legal Basis for Processing</h2>
          <ul className="list-disc pl-6">
            <li>Contractual obligation (e.g., invoice delivery)</li>
            <li>Legal obligation (e.g., tax or regulatory)</li>
            <li>Legitimate interest (e.g., fraud prevention)</li>
            <li>Consent (if applicable for communications)</li>
          </ul>

          <h2 className="h2 mt-6">7. Who We Share Data With</h2>
          <p>Your data may be shared with:</p>
          <ul className="list-disc pl-6">
            <li>Your instructed law firm</li>
            <li>Our hosting and payment service providers</li>
            <li>Regulators or authorities if legally required</li>
          </ul>

          <h2 className="h2 mt-6">8. Data Storage &amp; Retention</h2>
          <p>
            Data is stored in the UK or EEA. We retain invoice and legal service data for a minimum of
            6 years as required by law. Inactive login data may be deleted after 12 months.
          </p>

          <h2 className="h2 mt-6">9. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6">
            <li>Access a copy of your data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion (where applicable)</li>
            <li>Restrict or object to processing</li>
            <li>Withdraw consent (if previously given)</li>
          </ul>
          <p>
            To exercise your rights, email:{" "}
            <a href="mailto:privacy@xledger.co.uk">privacy@xledger.co.uk</a>
          </p>

          <h2 className="h2 mt-6">10. Cookies</h2>
          <p>
            We only use essential cookies for session authentication and login management. No third-party
            tracking or analytics cookies are used.
          </p>

          <h2 className="h2 mt-6">11. International Transfers</h2>
          <p>
            If data is transferred outside the UK or EEA, we use appropriate safeguards such as Standard
            Contractual Clauses and encryption measures to protect your data.
          </p>

          <h2 className="h2 mt-6">12. Complaints</h2>
          <p>
            If you believe your data rights have been violated, you may contact the Information
            Commissioner&apos;s Office (ICO):{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ico.org.uk
            </a>{" "}
            or call 0303 123 1113.
          </p>

          <h2 className="h2 mt-6">13. Updates</h2>
          <p>
            We may update this Privacy Notice from time to time. The latest version will always be
            available on this page with the effective date indicated.
          </p>

          <section id="legal-privacy-support" className="mt-8">
            <h2 className="h2">Legal and Privacy Policy Support</h2>

            <h3 className="mt-4 text-lg font-semibold text-brand-dark">
              1. Data Processing and Legal Basis
            </h3>
            <p>
              The system records task information (including task descriptions, hours worked, timestamps,
              and case identifiers) as part of legal service progress tracking. This data is used for
              invoice generation, compliance auditing, and client communication.
            </p>
            <p>
              All data processing is carried out in accordance with Article 6(1)(b) (contractual
              necessity) and 6(1)(f) (legitimate interest) of the UK GDPR, and in compliance with legal
              industry regulatory requirements (e.g. SRA Code of Conduct).
            </p>
            <p>
              The platform acts solely as a data processor under the direction and control of the law
              firm, which is the data controller.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-brand-dark">
              2. Technical and Security Measures
            </h3>
            <p>
              All task data is transmitted over TLS-encrypted connections. The system maintains access
              logs and records of data changes to ensure traceability and auditability. Access tokens are
              used exclusively for authentication and must be securely stored by the user.
            </p>
            <p>
              Users should avoid entering client names, litigation details, or other confidential
              information into task descriptions. The platform assumes no responsibility for any sensitive
              information entered in error.
            </p>

            <h3 className="mt-4 text-lg font-semibold text-brand-dark">
              3. Sample Data Processing Agreement (DPA) Clauses
            </h3>
            <ul className="list-disc pl-6">
              <li><strong>Data Controller:</strong> The Law Firm</li>
              <li><strong>Data Processor:</strong> XLedger Ltd</li>
              <li>
                <strong>Scope of Processing:</strong> Task records, hours worked, and case identifiers,
                for the purpose of legal service invoicing only.
              </li>
              <li><strong>Data Retention Period:</strong> 6 years, in accordance with SRA regulations and tax audit obligations.</li>
              <li>
                <strong>Sub-processors:</strong> Where applicable (e.g. AWS, Stripe), only those
                compliant with UK GDPR and relevant adequacy decisions will be used.
              </li>
            </ul>
          </section>

          <div className="mt-8 text-sm text-slate-600">
            &copy; 2025 XLedger | <a href="mailto:privacy@xledger.co.uk"></a>
          </div>
        </div>
      </div>
    </div>
  );
}
