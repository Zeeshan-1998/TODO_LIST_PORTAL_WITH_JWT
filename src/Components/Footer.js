import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="text-center">
        Explore, Discover, and Experience the Power of JWT
      </p>
      <p className="copyright">
        &copy; {currentYear} ZN Design. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
