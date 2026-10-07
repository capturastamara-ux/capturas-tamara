export type TeamMember = {
  id: string;
  name: string;
  photo: string;
  photoAlt: string;
  role?: string;
};

export const teamConfig = {
  sectionId: "equipo",
  eyebrow: "Nosotros",
  heading: "Equipo",
  pageTitle: "Equipo",
  pageIntro:
    "Conoce a quienes capturan cada momento: fotógrafos y apoyo creativo de Capturas Tamara.",
  members: [
    {
      id: "will-tamara",
      name: "Will Tamara",
      photo: "/images/hero/hero-desktop.jpeg",
      photoAlt: "Will Tamara, fotógrafo de Capturas Tamara",
    },
  ] as TeamMember[],
};
