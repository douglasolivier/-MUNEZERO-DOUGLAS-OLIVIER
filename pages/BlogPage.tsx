import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const BlogPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t('blogTitle')}</h1>

      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-xl text-gray-700 mb-4">
          {t('blogComingSoon', { appName: t('appName') })}
        </p>
        <p className="text-gray-600">
          {t('thankYouForYourPatience')}
        </p>
      </div>

      {/* Future sections for blog posts */}
      {/*
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Blog Post Title 1</h3>
          <p className="text-gray-600 text-sm mb-4">Date: October 26, 2023</p>
          <p className="text-gray-700">Short excerpt of the blog post content...</p>
          <a href="#" className="text-indigo-600 hover:underline mt-4 inline-block">Read More</a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Blog Post Title 2</h3>
          <p className="text-gray-600 text-sm mb-4">Date: October 19, 2023</p>
          <p className="text-gray-700">Short excerpt of the blog post content...</p>
          <a href="#" className="text-indigo-600 hover:underline mt-4 inline-block">Read More</a>
        </div>
      </div>
      */}
    </div>
  );
};

export default BlogPage;