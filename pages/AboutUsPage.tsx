import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutUsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{t('aboutUsTitle')}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          {t('aboutUsParagraph1', { appName: t('appName') })}
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          {t('aboutUsParagraph2', { appName: t('appName') })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{t('ourMission')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('ourMissionDescription')}
          </p>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">{t('ourVision')}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t('ourVisionDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;