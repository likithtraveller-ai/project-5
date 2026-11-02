import React from 'react';
import {
  GraduationCap,
  Megaphone,
  Code2,
  UserCheck,
  Briefcase,
  Bot,
} from 'lucide-react';
import { PersonaType } from '../types/persona';

interface PersonaIconProps {
  persona: PersonaType;
  className?: string;
}

export const PersonaIcon: React.FC<PersonaIconProps> = ({
  persona,
  className = 'w-4 h-4',
}) => {
  switch (persona) {
    case 'TEACHER':
      return <GraduationCap className={className} />;
    case 'MARKETER':
      return <Megaphone className={className} />;
    case 'DEVELOPER':
      return <Code2 className={className} />;
    case 'RECRUITER':
      return <UserCheck className={className} />;
    case 'CONSULTANT':
      return <Briefcase className={className} />;
    default:
      return <Bot className={className} />;
  }
};
