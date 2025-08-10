import React, { useState } from 'react';
import { motion } from 'framer-motion';

type InviteeRole = 'admin' | 'member' | 'viewer';

interface Invitee {
  email: string;
  role: InviteeRole;
}

interface TeamInvitationProps {
  onInviteTeam: (invitees: Invitee[]) => void;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const TeamInvitation: React.FC<TeamInvitationProps> = ({
  onInviteTeam,
  onComplete,
  onBack,
  onSkip
}) => {
  const [invitees, setInvitees] = useState<Invitee[]>([
    { email: '', role: 'member' }
  ]);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleAddInvitee = () => {
    if (!emailInput) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }

    if (invitees.some(inv => inv.email === emailInput)) {
      setError('This email has already been added');
      return;
    }

    setInvitees([...invitees, { email: emailInput, role: 'member' }]);
    setEmailInput('');
    setError('');
  };

  const handleRemoveInvitee = (index: number) => {
    const newInvitees = [...invitees];
    newInvitees.splice(index, 1);
    setInvitees(newInvitees);
  };

  const handleRoleChange = (index: number, role: InviteeRole) => {
    const newInvitees = [...invitees];
    newInvitees[index].role = role;
    setInvitees(newInvitees);
  };

  const handleEmailChange = (index: number, email: string) => {
    const newInvitees = [...invitees];
    newInvitees[index].email = email;
    setInvitees(newInvitees);
  };

  const handleComplete = () => {
    // Filter out empty emails
    const validInvitees = invitees.filter(inv => inv.email && validateEmail(inv.email));
    onInviteTeam(validInvitees);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Would you like to invite team members?
        </h1>
        <p className="text-lg text-gray-600">
          Collaborate with your team to get the most out of Reachly
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Team Members
              </label>

              {invitees.map((invitee, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={invitee.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="w-32">
                    <select
                      value={invitee.role}
                      onChange={(e) => handleRoleChange(index, e.target.value as InviteeRole)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInvitee(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}

              <div className="mt-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add another email address"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInvitee();
                        }
                      }}
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInvitee}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Permission Levels</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="font-medium mr-2">Admin:</span>
                  <span>Can manage organization settings, users, billing, and all campaigns</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">Member:</span>
                  <span>Can create and manage campaigns, contacts, and templates</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">Viewer:</span>
                  <span>Can view campaigns and reports but cannot make changes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </button>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
          >
            Finish Setup
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamInvitation;