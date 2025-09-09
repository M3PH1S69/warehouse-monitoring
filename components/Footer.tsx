import React from 'react';

const Footer: React.FC = () => {
  const appVersion = "2.0.1"; // As per CHANGELOG.md

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
      © {new Date().getFullYear()} Sistem Manajemen Inventaris Jaringan. All Rights Reserved. | Versi {appVersion}
    </footer>
  );
};

export default Footer;