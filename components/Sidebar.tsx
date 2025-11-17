import React, { ReactNode } from 'react';

interface SidebarProps {
  children: ReactNode;
  title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ children, title }) => {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="text-white text-xl font-semibold uppercase text-center">{title}</div>
      <nav>
        {children}
      </nav>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  children: ReactNode;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, children, isActive }) => {
  const activeClass = 'bg-indigo-700';
  const inactiveClass = 'hover:bg-gray-700';
  return (
    <a
      href={href}
      className={`block py-2.5 px-4 rounded transition duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {children}
    </a>
  );
};

export { Sidebar, SidebarLink };