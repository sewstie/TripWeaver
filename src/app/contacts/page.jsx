"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please fill out all required fields",
      });
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Please enter a valid email address",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const web3FormData = new FormData();
      web3FormData.append(
        "access_key",
        process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      );
      web3FormData.append("name", formData.name);
      web3FormData.append("email", formData.email);
      web3FormData.append(
        "subject",
        formData.subject || "Contact Form Submission"
      );
      web3FormData.append("message", formData.message);
      web3FormData.append("from_name", "TripWeaver Contact Form");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: web3FormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus({
          submitted: true,
          error: false,
          message: "Message sent successfully!",
        });

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(data.message || "Form submission failed");
      }
    } catch (error) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Failed to send. Please try again.",
      });
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--tw-background)] text-[var(--tw-text)] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mt-12 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="bg-[var(--tw-subbackground)] p-8 rounded-xl shadow-md h-full flex flex-col justify-center items-center text-center">
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-[var(--tw-focus)]">
                  Get in Touch
                </h2>
                <p className="mb-6 max-w-sm leading-relaxed">
                  Have questions about your next adventure? Want to know more
                  about our services? Fill out the form and our team will get
                  back to you as soon as possible.
                </p>
                <div className="w-16 h-1 bg-[var(--tw-focus)] opacity-50 rounded-full mt-2"></div>
              </div>
            </div>

            <div className="bg-[var(--tw-subbackground)] p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-[var(--tw-focus)]">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="hidden"
                  name="access_key"
                  value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY}
                />
                <input
                  type="hidden"
                  name="from_name"
                  value="TripWeaver Contact Form"
                />
                <input
                  type="checkbox"
                  name="botcheck"
                  className="hidden"
                  style={{ display: "none" }}
                />

                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border border-[var(--tw-border)] focus:border-[var(--tw-text)] text-[var(--tw-text)] placeholder-opacity-60"
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border border-[var(--tw-border)] focus:border-[var(--tw-text)] text-[var(--tw-text)] placeholder-opacity-60"
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="subject" className="block mb-2 font-medium">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border border-[var(--tw-border)] focus:border-[var(--tw-text)] text-[var(--tw-text)] placeholder-opacity-60"
                    placeholder="What is your message about?"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block mb-2 font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border border-[var(--tw-border)] focus:border-[var(--tw-text)] text-[var(--tw-text)] placeholder-opacity-60"
                    required
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <div className="mt-2 min-h-[20px] text-center text-sm transition-opacity duration-300">
                  {formStatus.submitted ? (
                    <p className="text-green-500 font-medium">
                      {formStatus.message}
                    </p>
                  ) : formStatus.error ? (
                    <p className="text-red-500 font-medium">
                      {formStatus.message}
                    </p>
                  ) : (
                    <p className="opacity-0">Status message placeholder</p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
