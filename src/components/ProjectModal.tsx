import React from 'react';
import { type ProjectItem } from '../utils/portfolioLogic';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  currentLang: 'en' | 'fr' | 'ar';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, currentLang }) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-[#fbfbf8] border-2 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000] my-8 rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top window bar */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full border border-black"></span>
            <span className="font-mono text-xs uppercase tracking-wider font-bold">
              PROJECT ARCHIVE // {project.year}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold hover:bg-red-600 transition-colors"
            aria-label="Close project modal"
          >
            ✕
          </button>
        </div>

        {/* Project Image */}
        <div className="aspect-[16/10] bg-neutral-900 border-2 border-black overflow-hidden relative group">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content details */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase">
            <span>{project.categoryLabel}</span>
            <span>·</span>
            <span>{project.year}</span>
            <span>·</span>
            <span>Zakaria Boubkeraoui</span>
          </div>

          <h3 className="font-display font-black text-2xl sm:text-3xl text-black uppercase">
            {project.title}
          </h3>

          <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
            {project.description}
          </p>

          {/* Tools utilized */}
          <div className="pt-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500 block mb-2">
              {currentLang === 'ar' ? 'الأدوات المستعملة:' : currentLang === 'fr' ? 'Outils utilisés :' : 'Tools Utilized:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-black text-white font-mono text-xs font-bold uppercase rounded-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-wrap gap-3">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all inline-flex items-center gap-2"
              >
                <span>{currentLang === 'ar' ? 'فتح المشروع الأصلي' : currentLang === 'fr' ? 'Ouvrir le Projet Original' : 'Open Live Asset'}</span>
                <span>↗</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-black font-mono text-xs font-bold uppercase border border-black/40 transition-colors"
            >
              {currentLang === 'ar' ? 'إغلاق' : currentLang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
