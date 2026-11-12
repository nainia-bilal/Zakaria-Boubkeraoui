import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { HeroDraftHeader } from './components/HeroDraftHeader';
import { HelloBento } from './components/HelloBento';
import { TimelineFilmstrip3D } from './components/TimelineFilmstrip3D';
import { TornPaperDivider } from './components/TornPaperDivider';
import { DarkStreetwearSection } from './components/DarkStreetwearSection';
import { TheStuSection } from './components/TheStuSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { ResumeModal } from './components/ResumeModal';
import { VerticalMontageRibbon3D } from './components/VerticalMontageRibbon3D';
import { type ProjectItem } from './utils/portfolioLogic';
import { PROJECTS } from './data/portfolioData';

export default function App() {
  const [currentLang, setCurrentLang] = useState<'en' | 'fr' | 'ar'>('en');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);

  const handleOpenContact = () => {
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectProjectById = (id: string) => {
    const proj = PROJECTS.find((p) => p.id === id);
    if (proj) {
      setSelectedProject(proj);
    }
  };

  const isRtl = currentLang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-graph-paper text-neutral-900 selection:bg-red-600 selection:text-white ${
        isRtl ? 'font-arabic' : 'font-body'
      }`}
    >
      {/* Sticky Navigation Bar */}
      <TopNav
        currentLang={currentLang}
        setLang={setCurrentLang}
        onOpenContact={handleOpenContact}
      />

      {/* 3D Vertical Montage Filmstrip Ribbon (Charit dyal Lmontag 3D habt mea landingpage) */}
      <VerticalMontageRibbon3D
        currentLang={currentLang}
        onSelectProjectById={handleSelectProjectById}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Editorial Header matching Pinterest Pin with 3D Cinema Camera */}
        <HeroDraftHeader currentLang={currentLang} />

        {/* 3-Column Bento Section with Red Selection Box & Skills */}
        <HelloBento currentLang={currentLang} />

        {/* 3D Cinema Editing Filmstrip / Timeline Tape (Charit dyal Lmontag 3D) */}
        <TimelineFilmstrip3D
          currentLang={currentLang}
          onSelectProjectById={handleSelectProjectById}
        />

        {/* Torn Paper Transition to Dark Section */}
        <TornPaperDivider variant="top-to-dark" />

        {/* Dark Streetwear Section with Red Sticker Outline Cutout & Stats */}
        <DarkStreetwearSection
          currentLang={currentLang}
          onOpenContact={handleOpenContact}
        />

        {/* Torn Paper Transition back to Paper Texture */}
        <TornPaperDivider variant="dark-to-bottom" />

        {/* The Stu / Studio Polaroids Section with Washi Tape */}
        <TheStuSection currentLang={currentLang} />

        {/* Filterable Selected Work / Projects Grid */}
        <ProjectsSection
          currentLang={currentLang}
          onSelectProject={(project) => setSelectedProject(project)}
        />

        {/* Services / Capabilities Section */}
        <ServicesSection
          currentLang={currentLang}
          onOpenContact={handleOpenContact}
        />

        {/* Contact Section & CV Access */}
        <ContactSection
          currentLang={currentLang}
          onOpenCvModal={() => setIsResumeModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer currentLang={currentLang} />

      {/* Interactive Project Lightbox Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        currentLang={currentLang}
      />

      {/* Interactive Printable Curriculum Vitae Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
