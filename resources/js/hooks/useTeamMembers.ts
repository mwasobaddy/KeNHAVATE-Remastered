import { useState } from 'react';

interface TeamMember {
  id?: number;
  name: string;
  email: string;
  role: string;
  permission: 'view' | 'edit';
}

interface UseTeamMembersReturn {
  teamMembers: TeamMember[];
  newMember: { name: string; email: string; role: string; permission: 'view' | 'edit' };
  duplicateError: string;
  setNewMember: (member: { name: string; email: string; role: string; permission: 'view' | 'edit' }) => void;
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setDuplicateError: (error: string) => void;
}

export function useTeamMembers(initialMembers: TeamMember[] = []): UseTeamMembersReturn {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialMembers);
  const [newMember, setNewMember] = useState<{ name: string; email: string; role: string; permission: 'view' | 'edit' }>({
    name: '',
    email: '',
    role: '',
    permission: 'view',
  });
  const [duplicateError, setDuplicateError] = useState('');

  const addTeamMember = () => {
    setDuplicateError('');

    if (!newMember.name || !newMember.email) {
      return;
    }

    const memberEmail = newMember.email.toLowerCase();
    const memberName = newMember.name.trim();

    // Check for duplicate email
    const isDuplicate = teamMembers.some(
      (member) => member.email.toLowerCase() === memberEmail
    );

    if (isDuplicate) {
      setDuplicateError('This email has already been added to the team.');

      return;
    }

    setTeamMembers([...teamMembers, { ...newMember }]);
    setNewMember({ name: '', email: '', role: '', permission: 'view' });
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const isCurrentUserInTeam = (currentUserEmail: string | null, currentUserWorkEmail: string | null): boolean => {
    if (!currentUserEmail && !currentUserWorkEmail) {
return false;
}
    
    const userEmail = (currentUserEmail || '').toLowerCase();
    const userWorkEmail = (currentUserWorkEmail || '').toLowerCase();

    return teamMembers.some(
      (member) => member.email.toLowerCase() === userEmail || member.email.toLowerCase() === userWorkEmail
    );
  };

  const validateSelfNotRemoved = (
    memberEmail: string, 
    currentUserEmail: string | null, 
    currentUserWorkEmail: string | null
  ): boolean => {
    if (!currentUserEmail && !currentUserWorkEmail) {
return true;
}
    
    const userEmail = (currentUserEmail || '').toLowerCase();
    const userWorkEmail = (currentUserWorkEmail || '').toLowerCase();
    const email = memberEmail.toLowerCase();

    return email !== userEmail && email !== userWorkEmail;
  };

  return {
    teamMembers,
    newMember,
    duplicateError,
    setNewMember,
    addTeamMember,
    removeTeamMember,
    setTeamMembers,
    setDuplicateError,
  };
}
