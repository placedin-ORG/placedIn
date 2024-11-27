import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["About", "Courses", "Privacy Policy", "Contact Us"].map(
                (link, index) => (
                  <li key={index}>
                    <a
                      href={`#${link.toLowerCase().replace(" ", "-")}`}
                      className="hover:text-orange-500 transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter to stay updated.
            </p>
            <form className="flex flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-md outline-none text-gray-800 focus:ring-2 focus:ring-orange-500 flex-1"
              />
              <button
                type="submit"
                className="mt-2 sm:mt-0 sm:ml-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <p className="text-gray-400 mb-2">Phone: +91 12345 67890</p>
            <p className="text-gray-400 mb-2">Email: support@example.com</p>
            <p className="text-gray-400 mb-2">
              Address: 123, Main Street, City
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-700" />

        {/* Social Media & Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          {/* Social Media */}
          <div className="flex space-x-4 mb-4 sm:mb-0">
            <a
              href="#"
              className="hover:text-orange-500 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12.1c0-5.2-4.3-9.5-9.5-9.5S3 6.8 3 12c0 4.8 3.4 8.8 8 9.4v-6.7H8.7v-2.7H11V9.4c0-2.3 1.3-3.6 3.2-3.6.9 0 1.8.1 2 .1v2.3h-1.4c-1.1 0-1.4.7-1.4 1.5v1.8h2.8l-.4 2.7h-2.4v6.7c4.6-.6 8-4.6 8-9.4z"></path>
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-orange-500 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h7v-7H9v-3h3V9c0-2.2 1.3-3.5 3.3-3.5.9 0 1.8.1 2 .1V8h-1.4c-1.1 0-1.4.7-1.4 1.5v1.8h2.8l-.4 3h-2.4v7h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-orange-500 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.6 7.8c-.8.4-1.6.6-2.5.8.9-.5 1.6-1.4 2-2.4-.8.5-1.8.8-2.7 1-1-.9-2.2-1.5-3.5-1.5-2.7 0-5 2.3-5 5.1 0 .4.1.9.2 1.2-4.1-.2-7.7-2.2-10.1-5.1-.4.8-.5 1.7-.5 2.5 0 1.8.8 3.3 2 4.3-.7 0-1.4-.2-2-.5v.1c0 2.5 1.7 4.5 4 5-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 1.9 2.4 3.3 4.6 3.3-1.6 1.3-3.6 2.1-5.7 2.1-.4 0-.7 0-1-.1C2.5 20.3 5.3 21 8.3 21c9.4 0 14.5-7.7 14.5-14.5v-.7c1-.7 1.8-1.5 2.4-2.3z"></path>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-400">
            © {new Date().getFullYear()} Your Company. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
