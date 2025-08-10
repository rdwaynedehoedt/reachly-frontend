# Reachly Onboarding UI Design

## Overview

This document outlines the user onboarding flow for Reachly, inspired by Apollo's smooth, professional onboarding experience. The goal is to create a guided, step-by-step process that helps users set up their account, understand their role, and create or join an organization.

## Design Principles

1. **Progressive Disclosure**: Present information in digestible chunks
2. **Visual Progress**: Clear indicators of progress through the onboarding journey
3. **Smooth Transitions**: Subtle animations between steps for a polished feel
4. **Personalization**: Tailor the experience based on user selections
5. **Skip Options**: Allow experienced users to bypass certain steps
6. **Mobile Responsiveness**: Ensure the experience works on all devices

## Onboarding Flow

### Step 1: Role Selection

**Purpose**: Understand the user's role to personalize their experience

**UI Components**:
- Header: "What best describes your role?"
- Subtitle: "We'll use this information to surface the most relevant features for you"
- Role options (cards with icons):
  - Marketing Manager
  - Sales Representative
  - Business Owner/Founder
  - Operations Manager
  - Customer Success
  - Other

**Interactions**:
- Selecting a card highlights it with a subtle animation
- "Continue" button becomes active after selection
- Progress indicator shows 1/5 complete

### Step 2: Goal Selection

**Purpose**: Understand what the user wants to achieve with Reachly

**UI Components**:
- Header: "What would you like to do with Reachly?"
- Subtitle: "We'll use your input to recommend the best next steps"
- Multi-select options (based on selected role):
  - Create email campaigns
  - Manage contacts and leads
  - Track email performance
  - Automate follow-ups
  - Collaborate with team members
  - Other (with text input)

**Interactions**:
- Multiple selections allowed with checkbox animation
- "Continue" button active by default
- Progress indicator shows 2/5 complete

### Step 3: Experience Level

**Purpose**: Gauge user's familiarity with similar tools

**UI Components**:
- Header: "What's your level of experience with email marketing tools?"
- Subtitle: "Reachly has features for all skill levels. We'll suggest the right ones for you."
- Experience levels (with visual slider):
  - Beginner: "I'm new to email marketing tools"
  - Intermediate: "I've used similar tools before"
  - Advanced: "I'm experienced with email marketing platforms"

**Interactions**:
- Slider with smooth animation between options
- Selected option shows additional context text
- "Continue" and "Skip" buttons available
- Progress indicator shows 3/5 complete

### Step 4: Organization Setup

**Purpose**: Create new organization or join existing one

**UI Components**:
- Header: "Let's set up your organization"
- Subtitle: "Create a new organization or join an existing one"
- Two options with toggle:
  1. Create new organization:
     - Organization name input
     - Industry dropdown
     - Company size dropdown
  2. Join existing organization:
     - Search box for organization name
     - Results display with organization details

**Interactions**:
- Toggle between create/join with smooth transition
- Form validation with helpful error messages
- "Continue" button enabled when required fields are complete
- Progress indicator shows 4/5 complete

### Step 5: Team Invitation

**Purpose**: Invite team members to collaborate

**UI Components**:
- Header: "Would you like to invite team members?"
- Subtitle: "Collaborate with your team to get the most out of Reachly"
- Email input field (multiple entries)
- Role selection for each invitee
- Permission level selection:
  - Admin: Full access to settings and billing
  - Member: Access to campaigns and contacts
  - Viewer: View-only access

**Interactions**:
- Add multiple emails with chips/tags
- Role selection dropdown for each
- "Skip" and "Finish Setup" buttons
- Progress indicator shows 5/5 complete

### Completion Screen

**Purpose**: Confirm successful setup and guide next steps

**UI Components**:
- Success animation (checkmark or celebration)
- Header: "You're all set!"
- Subtitle: "Your Reachly account is ready to use"
- Personalized next steps based on earlier selections
- Quick action buttons:
  - "Create First Campaign"
  - "Import Contacts"
  - "Explore Dashboard"

**Interactions**:
- Confetti animation on completion
- Smooth transition to dashboard after selection
- Help tooltip offering guided tour

## UI Components

### Progress Indicator

- Horizontal steps indicator at top of screen
- Current step highlighted
- Completed steps with checkmark
- Subtle animation when moving between steps

### Navigation Controls

- "Previous" button (left-aligned)
- "Continue" button (right-aligned)
- "Skip" option where applicable (smaller text)

### Animations

1. **Transitions**: Fade and slide between steps (300ms duration)
2. **Selection**: Subtle scale and color change (150ms duration)
3. **Progress**: Smooth filling of progress bar (200ms duration)
4. **Success**: Celebratory animation on completion (confetti, checkmark)

### Color Scheme

- Primary action: #4F46E5 (indigo)
- Secondary/inactive: #9CA3AF (gray)
- Success: #10B981 (green)
- Background: #F9FAFB (light gray)
- Text: #111827 (near black)
- Subtle text: #6B7280 (medium gray)

## Mobile Considerations

- Stack options vertically on smaller screens
- Ensure touch targets are at least 44px
- Simplify animations for better performance
- Adjust typography for readability

## Implementation Notes

### Technologies

- React for component structure
- Framer Motion for animations
- TailwindCSS for styling
- React Hook Form for form handling

### Key Components

```jsx
// Example Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`step-indicator ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
          >
            {index < currentStep ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} 
        />
      </div>
    </div>
  );
};
```

### Animation Examples

```jsx
// Example transition animation with Framer Motion
import { motion } from 'framer-motion';

const StepTransition = ({ children, direction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'next' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'next' ? -20 : 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};
```

## Next Steps

1. Create high-fidelity mockups in Figma
2. Develop reusable components for the onboarding flow
3. Implement state management for the multi-step process
4. Connect to backend APIs for data persistence
5. Test with users and iterate based on feedback