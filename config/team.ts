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
  publicPath: "/equipo",
  /** Solo si aún no hay perfiles en el panel (migración / respaldo). */
  fallbackMembers: [] as TeamMember[],
};
