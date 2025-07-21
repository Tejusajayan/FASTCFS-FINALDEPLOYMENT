import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";
import fastCfsLogo from "@assets/FAST CFS Logo - PNG_1752129714357.png";
import React, { useState } from "react";

// Simple modal component
function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>
        <div className="text-gray-800 text-sm max-h-[60vh] overflow-y-auto whitespace-pre-line">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [modal, setModal] = useState<null | "privacy" | "terms" | "cookie">(null);

  return (
    <>
      {/* Modals */}
      <Modal
        open={modal === "privacy"}
        onClose={() => setModal(null)}
        title="Privacy Policy"
      >
        {`Effective Date: 17/07/2025
Company Name: FastCFS Cargo Services LLC
Website: www.fastcfs.com

At FastCFS, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website or services.

1. Information We Collect
Personal Information: Name, email, phone number, address, identification documents.

Shipment Details: Cargo content, delivery address, sender/receiver info.

2. How We Use Your Information
To provide and manage shipping and logistics services

To communicate updates about your shipment

For billing, invoicing, and customer support

To improve our website and services

To comply with legal obligations

3. Sharing Your Information
We do not sell your data. We may share your information with:

Logistics partners (carriers, customs, agents)

Government or legal authorities (as required)

IT and service providers (website hosting, email)

4. Data Security
We implement industry-standard security measures to protect your data. However, no method is 100% secure.

5. Your Rights
You have the right to:

Access, update, or delete your data

Withdraw consent

Request data portability

To exercise these rights, contact us at info@fastcfs.com .

6. Retention
We retain personal data as long as necessary to fulfill our obligations or as required by law.

7. Contact
If you have any questions, contact us:
📧 info@fastcfs.com
📍 6, 30st, Umm Ramool, Rashidiya, Dubai, UAE
📞 +971 4 3496244
`}
      </Modal>
      <Modal
        open={modal === "terms"}
        onClose={() => setModal(null)}
        title="Terms of Service"
      >
        {`Effective Date: 17/07/2025
Company Name: FastCFS Cargo Services LLC
Website: www.fastcfs.com

By using our website or services, you agree to the following Terms of Service.

1. Services
FastCFS provides freight forwarding, customs clearance, cargo tracking, and related services.

2. User Responsibilities
You agree to:

Provide accurate shipment and contact information

Comply with all applicable laws and customs regulations

Not ship prohibited or illegal goods

3. Payment Terms
All fees must be paid in full before the shipment is released or delivered unless otherwise agreed in writing.

4. Liability
We are not liable for:

Delays due to customs, weather, or third-party carriers

Loss or damage due to improper packaging or misdeclared goods

Indirect, incidental, or consequential damages

5. Intellectual Property
All content on this site (text, logos, images) is the property of FastCFS and may not be copied without permission.

6. Termination
We reserve the right to suspend or terminate access to our services for violation of these terms.

7. Modifications
We may update these terms at any time. Continued use of our site or services means you accept the changes.
`}
      </Modal>
      <Modal
        open={modal === "cookie"}
        onClose={() => setModal(null)}
        title="Cookie Policy"
      >
        {`Effective Date: 17/07/2025

This Cookie Policy explains how FastCFS uses cookies and similar technologies on our website.

1. What Are Cookies?
Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.

2. Types of Cookies We Use
Essential Cookies: Required for website functionality (e.g., login, tracking form)

Analytics Cookies: Track site usage (e.g., Google Analytics)

Functional Cookies: Remember your preferences

3. How to Control Cookies
You can manage cookie settings in your browser. Blocking cookies may affect your site experience.

4. Third-Party Cookies
Some cookies may be set by third-party tools we use, such as live chat or analytics services.

5. Consent
By continuing to use our site, you consent to our use of cookies.
`}
      </Modal>
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src={fastCfsLogo} alt="FAST CFS" className="h-8 w-auto" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Leading logistics and freight forwarding services connecting Dubai, China, India with Africa through reliable, 
                efficient, and professional shipping solutions.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/profile.php?id=100083701370588" className="w-10 h-10 bg-fast-blue rounded-lg flex items-center justify-center hover:bg-fast-blue-dark transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://share.google/ftXX4KtX2GNLzLkyo" className="w-10 h-10 bg-fast-blue rounded-lg flex items-center justify-center hover:bg-fast-blue-dark transition-colors">
                  <Building2 className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/fastcfscargo?igsh=MXF5YjF6bWE4M3VvOA==" className="w-10 h-10 bg-fast-blue rounded-lg flex items-center justify-center hover:bg-fast-blue-dark transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cargo-tracking"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Cargo Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/branches"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Branches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/services#ocean-freight"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Ocean Freight
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#air-freight"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Air Freight
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#land-transport"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Land Transport
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#warehousing"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Warehousing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services#customs-clearance"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                  >
                    Customs Clearance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-fast-blue flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Dubai, UAE</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-fast-blue flex-shrink-0" />
                  <span className="text-gray-300 text-sm">+971 4 3496244</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-fast-blue flex-shrink-0" />
                  <span className="text-gray-300 text-sm">info@fastcfs.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 FAST CFS. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button
                className="text-gray-300 hover:text-white transition-colors text-sm"
                onClick={() => setModal("privacy")}
                type="button"
              >
                Privacy Policy
              </button>
              <button
                className="text-gray-300 hover:text-white transition-colors text-sm"
                onClick={() => setModal("terms")}
                type="button"
              >
                Terms of Service
              </button>
              <button
                className="text-gray-300 hover:text-white transition-colors text-sm"
                onClick={() => setModal("cookie")}
                type="button"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
