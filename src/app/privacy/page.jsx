export default function PrivacyPolicy() {
  return (
    <div className="bg-[var(--tw-background)] text-[var(--tw-text)] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-[var(--tw-focus)]">
          Privacy Policy
        </h1>

        <div className="bg-[var(--tw-subbackground)] p-6 rounded-xl shadow-md">
          <div className="mb-6">
            <p className="mb-4">
              Thank you for using TripWeaver! Your privacy is important to us.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our web application.
            </p>
            <p className="mb-4">
              Please read this policy carefully. If you do not agree with the
              terms of this privacy policy, please do not access the
              application.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We may collect information about you in a variety of ways. The
              information we may collect on the Site includes:
            </p>

            <h3 className="text-xl font-medium mb-2">
              A. Personal Data You Provide to Us
            </h3>
            <p className="mb-4">
              We collect personally identifiable information that you
              voluntarily provide to us when you register for an account or use
              the services on TripWeaver. This includes:
            </p>

            <ul className="list-disc ml-8 mb-4 space-y-2">
              <li>
                <span className="font-medium">Account Information:</span> When
                you register, we collect your name, email address, and password
                (which is hashed). If you register using a third-party provider
                like Google or GitHub, we receive information from that
                provider, such as your name, email address, and profile picture.
              </li>
              <li>
                <span className="font-medium">Trip & Itinerary Data:</span> We
                collect all the data you generate while using the service,
                including trip names, destinations, dates, notes, and the
                details of itinerary items (sights, locations, etc.).
              </li>
              <li>
                <span className="font-medium">Collaborator Information:</span>{" "}
                If you use the "Share" feature, we collect the email addresses
                of the users you invite to collaborate on a trip.
              </li>
            </ul>

            <h3 className="text-xl font-medium mb-2">
              B. Data We Collect Automatically
            </h3>
            <p className="mb-4">
              When you access the Site, we may automatically collect certain
              information about your device and usage, including:
            </p>

            <ul className="list-disc ml-8 mb-4 space-y-2">
              <li>
                <span className="font-medium">Log and Usage Data:</span> Our
                servers automatically collect information when you access the
                Site, such as your IP address, browser type, operating system,
                access times, and the pages you have viewed directly before and
                after accessing the Site.
              </li>
              <li>
                <span className="font-medium">Cookies:</span> We may use cookies
                to help customize the application and improve your experience.
                We use cookies primarily for session management to keep you
                logged in. You can remove or reject cookies in your browser
                settings, but be aware that such action could affect the
                availability and functionality of the application.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              Having accurate information about you permits us to provide you
              with a smooth, efficient, and customized experience. Specifically,
              we use information collected about you to:
            </p>

            <ul className="list-disc ml-8 mb-4">
              <li>Create and manage your account.</li>
              <li>
                Provide the core functionality of the trip planning service.
              </li>
              <li>
                Enable collaboration between you and other users you invite.
              </li>
              <li>Display your trip information, including on maps.</li>
              <li>Improve the application and troubleshoot issues.</li>
              <li>
                Communicate with you about your account or service updates.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              3. How We Share Your Information
            </h2>
            <p className="mb-4">
              We do not sell your personal information. We may share information
              we have collected about you in certain situations:
            </p>

            <ul className="list-disc ml-8 mb-4 space-y-2">
              <li>
                <span className="font-medium">With Your Collaborators:</span>{" "}
                When you share a trip with another user, they will have access
                to the trip's data according to the role you assign them
                ("Viewer" or "Editor").
              </li>
              <li>
                <span className="font-medium">
                  With Third-Party Service Providers:
                </span>{" "}
                We use third-party services to operate our application. These
                services have access to your data only to perform their
                functions and are obligated not to disclose or use it for any
                other purpose. These include:
                <ul className="list-circle ml-8 mt-2 space-y-1">
                  <li>
                    Firebase (by Google): For database hosting, user
                    authentication, and data storage.
                  </li>
                  <li>Vercel: For hosting our web application.</li>
                  <li>
                    OpenCage: For geocoding location data to display on maps.
                  </li>
                </ul>
              </li>
              <li>
                <span className="font-medium">
                  By Law or to Protect Rights:
                </span>
                We will share information if required by law, such as in
                response to a subpoena, or if we believe in good faith that
                disclosure is necessary to protect our rights, your safety, or
                the safety of others.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              4. Data Security
            </h2>
            <p className="mb-4">
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              5. Your Data Rights and Choices
            </h2>
            <p className="mb-4">
              You have rights concerning your personal information:
            </p>

            <ul className="list-disc ml-8 mb-4">
              <li>
                <span className="font-medium">Access and Update:</span> You can
                access and update your basic profile information at any time via
                your Account Page.
              </li>
              <li>
                <span className="font-medium">Deletion:</span> You can delete
                your account. Upon your request, we will delete your account and
                information from our active databases. Some information may be
                retained in our backup files to prevent fraud, troubleshoot
                problems, and comply with legal requirements.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              6. Children's Privacy
            </h2>
            <p className="mb-4">
              Our service is not directed to individuals under the age of 13. We
              do not knowingly collect personal information from children under
              13. If we become aware that a child under 13 has provided us with
              personal information, we will take steps to delete such
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--tw-focus)]">
              7. Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by updating the "Last Updated" date of
              this Privacy Policy. You are encouraged to periodically review
              this Privacy Policy to stay informed of our updates.
            </p>
          </section>

          <div className="text-sm mt-12 border-t border-[var(--tw-border)] pt-4">
            <p>Last Updated: July 10, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
