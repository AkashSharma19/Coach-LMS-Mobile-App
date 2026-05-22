export interface Assignment {
  id: string; // Unique dynamic route ID, e.g. "1_0" (courseId_index)
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted';
  score?: string;
  weight?: string;
  totalScore?: string;
  grade?: string;
  description: string;
  instructions: string[];
  resources?: Material[];
  rubric?: { criteria: string; points: string }[];
}

export interface Material {
  name: string;
  url?: string;
}

export interface Session {
  topic: string;
  subtopic?: string;
  date: string;
  time: string;
  status: 'P' | 'A' | 'U';
  type: 'Online' | 'Offline' | 'Hybrid';
  feedbackStatus?: 'pending' | 'submitted';
  objective?: string;
  recordingUrl?: string;
  preReads?: Material[];
  inClassMaterial?: Material[];
  postClassMaterial?: Material[];
  faculty?: string;
  programAssociate?: string;
}

export interface Evaluation {
  name: string;
  weight: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  topic: string;
  instructor: {
    name: string;
    initials: string;
  };
  progress: number; // 0 to 1
  grade: string;
  attendance: number;
  nextClass: string;
  location: string;
  category: string;
  status: 'in-progress' | 'completed';
  color: string;
  objective: string;
  evaluationCriteria: Evaluation[];
  sessions: Session[];
  assignments: Assignment[];
  term: string;
  classType: 'InClass' | 'OutClass';
}

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'ECON-302',
    title: 'Microeconomics III',
    topic: 'Game Theory & Dynamic Applications',
    instructor: { name: 'Dr. Robert Vance', initials: 'RV' },
    progress: 0.72,
    grade: 'A-',
    attendance: 84,
    nextClass: 'Today, 09:00 AM',
    location: 'Room 207, 2nd floor - CDS',
    category: 'INCLASS',
    status: 'in-progress',
    color: '#EBC063', // Gold
    objective: 'Develops structural models of strategic decision-making in markets. Integrates perfect competition, monopolies, advanced game theory strategies, and pricing under asymmetric conditions.',
    evaluationCriteria: [
      { name: 'Midterm Examination', weight: '30%' },
      { name: 'Final Analysis Paper', weight: '40%' },
      { name: 'Assignments & Problem Sets', weight: '20%' },
      { name: 'Class Participation', weight: '10%' }
    ],
    sessions: [
      { 
        topic: 'Intro to Game Theory & Nash Equilibrium', 
        subtopic: 'Simultaneous Games, Dominant Strategies, and Best Response Functions',
        date: 'May 10', 
        time: '09:00 AM - 10:30 AM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'submitted',
        objective: 'Formulate normal-form games and solve for pure-strategy Nash equilibria in static settings using best-response analysis.',
        recordingUrl: 'https://coach-lms.edu/recordings/econ302-s1.mp4',
        preReads: [
          { name: 'Varian Ch 4: Foundations of Game Theory', url: 'https://econ.yale.edu/foundation.pdf' },
          { name: 'Nash (1950) Bargaining Concept Paper', url: 'https://www.jstor.org/stable/1969085' }
        ],
        inClassMaterial: [
          { name: 'Lecture Slides 01: Normal Form Representation', url: 'https://coach-lms.edu/econ302-s1.pdf' },
          { name: 'Interactive Matrix Solver Worksheet', url: 'https://coach-lms.edu/matrix-solver' }
        ],
        postClassMaterial: [
          { name: 'Problem Set 1: Nash Equilibrium Calculations', url: 'https://coach-lms.edu/econ302-ps1.pdf' },
          { name: 'Solution Sheet: Prisoner\'s Dilemma Variants', url: 'https://coach-lms.edu/econ302-ps1-sol.pdf' }
        ],
        faculty: 'Dr. Robert Vance',
        programAssociate: 'Sarah Jenkins'
      },
      { 
        topic: 'Dynamic Games & Subgame Perfection', 
        subtopic: 'Extensive Form representation, Backwards Induction, and Credibility',
        date: 'May 12', 
        time: '09:00 AM - 10:30 AM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'submitted',
        objective: 'Analyze extensive-form games using game trees and solve for subgame perfect Nash equilibria using backward induction.',
        recordingUrl: 'https://coach-lms.edu/recordings/econ302-s2.mp4',
        preReads: [
          { name: 'Gibbons Ch 2: Dynamic Games of Complete Info', url: 'https://coach-lms.edu/gibbons-ch2.pdf' },
          { name: 'Entry Deterrence Models and Game Trees', url: 'https://coach-lms.edu/entry-deterrence.pdf' }
        ],
        inClassMaterial: [
          { name: 'Class Handout: Extensive Form & Info Sets', url: 'https://coach-lms.edu/handout-s2.pdf' },
          { name: 'Backward Induction Simulator File', url: 'https://coach-lms.edu/induction-sim' }
        ],
        postClassMaterial: [
          { name: 'Problem Set 2: Stackelberg Competition Models', url: 'https://coach-lms.edu/econ302-ps2.pdf' }
        ],
        faculty: 'Dr. Robert Vance',
        programAssociate: 'Sarah Jenkins'
      },
      { 
        topic: 'Asymmetric Information & Signaling', 
        subtopic: 'Adverse Selection, Spence Signaling Model, and Screen Mechanics',
        date: 'May 15', 
        time: '09:00 AM - 10:30 AM',
        status: 'A',
        type: 'Hybrid',
        feedbackStatus: 'pending',
        objective: 'Evaluate structural market outcomes under asymmetric information and characterize pooling and separating equilibria.',
        recordingUrl: 'https://coach-lms.edu/recordings/econ302-s3.mp4',
        preReads: [
          { name: 'Akerlof (1970) The Market for Lemons', url: 'https://www.jstor.org/stable/1879431' },
          { name: 'Spence (1973) Job Market Signaling', url: 'https://www.jstor.org/stable/1882010' }
        ],
        inClassMaterial: [
          { name: 'Slides: Signaling vs Screening in Insurance', url: 'https://coach-lms.edu/slides-s3.pdf' }
        ],
        postClassMaterial: [
          { name: 'Self-Assessment Quiz: Separating Constraints', url: 'https://coach-lms.edu/quiz-s3' }
        ],
        faculty: 'Dr. Robert Vance',
        programAssociate: 'Sarah Jenkins'
      },
      { 
        topic: 'Mechanism Design & Auction Theory', 
        subtopic: 'Revenue Equivalence Theorem, Vickrey Auctions, and Truthful Revelation',
        date: 'May 17', 
        time: '09:00 AM - 10:30 AM',
        status: 'U',
        type: 'Online',
        feedbackStatus: 'pending',
        objective: 'Explain the principles of mechanism design and prove revenue equivalence between English, Dutch, First-Price, and Vickrey auctions.',
        recordingUrl: 'https://coach-lms.edu/recordings/econ302-s4.mp4',
        preReads: [
          { name: 'Krishna Ch 2-3: Private Value Auctions', url: 'https://coach-lms.edu/krishna-auctions.pdf' }
        ],
        inClassMaterial: [
          { name: 'In-Class Activity: Double Auction Trading', url: 'https://coach-lms.edu/double-auction' }
        ],
        postClassMaterial: [
          { name: 'Bidding Simulation Homework Guide', url: 'https://coach-lms.edu/bidding-sim.pdf' }
        ],
        faculty: 'Dr. Robert Vance',
        programAssociate: 'Sarah Jenkins'
      },
      { 
        topic: 'Folk Theorems & Infinitely Repeated Games', 
        subtopic: 'Trigger Strategies, Discount Factors, and Cooperation Sustainability',
        date: 'May 20', 
        time: '09:00 AM - 10:30 AM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'pending',
        objective: 'Demonstrate how cooperation can be sustained in infinitely repeated games using trigger strategies and calculate minimum discount factors.',
        recordingUrl: 'https://coach-lms.edu/recordings/econ302-s5.mp4',
        preReads: [
          { name: 'Fudenberg & Tirole Ch 5: Repeated Games', url: 'https://coach-lms.edu/repeated-games.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Grim Trigger vs Tit-for-Tat', url: 'https://coach-lms.edu/slides-s5.pdf' }
        ],
        postClassMaterial: [
          { name: 'Review Guide: ECON-302 Midterm Outline', url: 'https://coach-lms.edu/midterm-guide.pdf' }
        ],
        faculty: 'Dr. Robert Vance',
        programAssociate: 'Sarah Jenkins'
      }
    ],
    assignments: [
      { 
        id: '1_0',
        title: 'Problem Set 1: Nash Bargaining', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '95', 
        weight: '10%', 
        totalScore: '100', 
        grade: 'A',
        description: 'Mathematical modeling of strategic bargaining. Formulate non-cooperative bargaining games under alternating offer regimes and calculate subgame perfect equilibrium parameters.',
        instructions: [
          'Define normal form players, information structures, and dynamic payout equations.',
          'Apply backwards induction to solve for the unique stationary subgame perfect equilibrium of the infinite horizon model.',
          'Evaluate comparative statics regarding changes in players\' subjective discount factors.'
        ],
        resources: [
          { name: 'Rubinstein (1982) Alternating Offers Classic Paper', url: 'https://econ.yale.edu/rubinstein1982.pdf' },
          { name: 'ECON-302 PS1 Equations Cheat Sheet', url: 'https://coach-lms.edu/cheatsheets/econ302-ps1-math.pdf' }
        ],
        rubric: [
          { criteria: 'Dynamic Game Tree formulation', points: '30 Pts' },
          { criteria: 'Backward Induction & Proof soundness', points: '40 Pts' },
          { criteria: 'Discount Factor analysis and comparative statics', points: '30 Pts' }
        ]
      },
      { 
        id: '1_1',
        title: 'Problem Set 2: Dynamic Cournot', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '45', 
        weight: '10%', 
        totalScore: '50', 
        grade: 'A+',
        description: 'Analyze quantitative market structures in multi-stage dynamic duopolies. Apply Stackelberg strategies and compare Nash equilibria outcomes to standard static joint-maximization collusion benchmarks.',
        instructions: [
          'Derive reaction curves for simultaneous production firms with symmetric costs.',
          'Solve for subgame perfect equilibrium when one firm acts as the first-mover Stackelberg leader.',
          'Compute deadweight loss and consumer surplus variances between Cournot and Stackelberg regimes.'
        ],
        resources: [
          { name: 'Cournot-Stackelberg Mathematical Reference Document', url: 'https://coach-lms.edu/resources/cournot-stackelberg.pdf' }
        ],
        rubric: [
          { criteria: 'Cournot static reaction curves mathematical derivation', points: '15 Pts' },
          { criteria: 'Stackelberg dynamic equilibrium backward induction', points: '25 Pts' },
          { criteria: 'Surplus calculations and market efficiency critique', points: '10 Pts' }
        ]
      },
      { 
        id: '1_2',
        title: 'Midterm Research Briefing', 
        dueDate: 'May 28, 2026', 
        status: 'pending', 
        weight: '30%', 
        totalScore: '100',
        description: 'Draft a formal executive economic research brief analyzing real-world asymmetric signaling designs. Deconstruct Spence job-market signaling or Rothschild-Stiglitz screening mechanisms within an active industry sector.',
        instructions: [
          'Select an industry sector (e.g. Health Insurance, Labor, Used Goods) exhibiting asymmetric information.',
          'Map mathematical parameters of the high-ability vs low-ability agent cost constraints.',
          'Model the separating and pooling equilibria configurations. Critique current market efficiency.',
          'Structure the output under professional academic journal formatting guidelines (4-6 pages).'
        ],
        resources: [
          { name: 'Research Briefing Template & LaTeX Guide', url: 'https://coach-lms.edu/briefing-template' },
          { name: 'Sample Economic Brief: Spence Signaling applied to IT', url: 'https://coach-lms.edu/samples/spence-it-example.pdf' }
        ],
        rubric: [
          { criteria: 'Industry profile and asymmetry categorization', points: '20 Pts' },
          { criteria: 'Separating constraints mathematical modeling', points: '40 Pts' },
          { criteria: 'Policy recommendations and strategic efficiency critique', points: '30 Pts' },
          { criteria: 'Academic formatting and prose elegance', points: '10 Pts' }
        ]
      }
    ],
    term: 'Spring 2026',
    classType: 'InClass'
  },
  {
    id: '2',
    code: 'BUS-101',
    title: 'Business Administration',
    topic: 'Organizational Behavior & Human Capital',
    instructor: { name: 'Prof. Evelyn Sterling', initials: 'ES' },
    progress: 0.45,
    grade: 'B+',
    attendance: 79,
    nextClass: 'Today, 11:15 AM',
    location: 'Auditorium 1, Ground Floor',
    category: 'INCLASS',
    status: 'in-progress',
    color: '#4A90E2', // Blue
    objective: 'Explores foundational management theory, team dynamics, workplace culture models, motivation drivers, and administrative framework designs for modern enterprises.',
    evaluationCriteria: [
      { name: 'Leadership Case Studies', weight: '30%' },
      { name: 'Final Administrative Audit', weight: '40%' },
      { name: 'Group Presentation', weight: '20%' },
      { name: 'Forum Discussions', weight: '10%' }
    ],
    sessions: [
      { 
        topic: 'Organizational Systems & Design', 
        subtopic: 'Bureaucracy vs Holacracy, Spans of Control, and Matrix Frameworks',
        date: 'May 08', 
        time: '11:15 AM - 12:45 PM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'submitted',
        objective: 'Contrast bureaucratic structures with self-managed holacracies and define matrix communication channels in global firms.',
        recordingUrl: 'https://coach-lms.edu/recordings/bus101-s1.mp4',
        preReads: [
          { name: 'Mintzberg (1979) The Structuring of Organizations', url: 'https://coach-lms.edu/mintzberg-structure.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Organizational Layout Hierarchies', url: 'https://coach-lms.edu/org-hierarchies.pdf' }
        ],
        postClassMaterial: [
          { name: 'Case Assignment: Zappos Holacracy Transition', url: 'https://coach-lms.edu/zappos-holacracy.pdf' }
        ],
        faculty: 'Prof. Evelyn Sterling',
        programAssociate: 'Marcus Chen'
      },
      { 
        topic: 'Conflict Resolution & Negotiation', 
        subtopic: 'Thomas-Kilmann Conflict Mode Instrument, BATNA, and ZOPA',
        date: 'May 11', 
        time: '11:15 AM - 12:45 PM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'submitted',
        objective: 'Apply the Thomas-Kilmann conflict mode framework and formulate structured multi-issue bargaining matrices using BATNA principles.',
        recordingUrl: 'https://coach-lms.edu/recordings/bus101-s2.mp4',
        preReads: [
          { name: 'Getting to Yes: Negotiating Agreement', url: 'https://coach-lms.edu/getting-to-yes.pdf' }
        ],
        inClassMaterial: [
          { name: 'Negotiation Roleplay: Star Tech Mergers', url: 'https://coach-lms.edu/negotiation-roleplay.pdf' }
        ],
        postClassMaterial: [
          { name: 'Reflection Log: Negotiator BATNA Analysis', url: 'https://coach-lms.edu/batna-reflection' }
        ],
        faculty: 'Prof. Evelyn Sterling',
        programAssociate: 'Marcus Chen'
      },
      { 
        topic: 'Performance Appraisals & Incentives', 
        subtopic: '360-Degree Feedback Systems, Balanced Scorecards, and Principal-Agent Problems',
        date: 'May 14', 
        time: '11:15 AM - 12:45 PM',
        status: 'P',
        type: 'Hybrid',
        feedbackStatus: 'pending',
        objective: 'Design robust 360-degree appraisal cycles and analyze the alignment of employee metrics with corporate objectives using Balanced Scorecards.',
        recordingUrl: 'https://coach-lms.edu/recordings/bus101-s3.mp4',
        preReads: [
          { name: 'Kaplan & Norton: Using the Balanced Scorecard', url: 'https://coach-lms.edu/balanced-scorecard.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Performance Appraisals Mechanics', url: 'https://coach-lms.edu/appraisal-slides.pdf' }
        ],
        postClassMaterial: [
          { name: 'Case study: Wells Fargo Sales Quota Scandals', url: 'https://coach-lms.edu/wellsfargo-scandal.pdf' }
        ],
        faculty: 'Prof. Evelyn Sterling',
        programAssociate: 'Marcus Chen'
      },
      { 
        topic: 'Human Capital & Talent Development', 
        subtopic: 'Competency Mapping, High-Potential Tracking, and Succession Planning',
        date: 'May 18', 
        time: '11:15 AM - 12:45 PM',
        status: 'A',
        type: 'Offline',
        feedbackStatus: 'pending',
        objective: 'Synthesize competency models for executive tracking and architect structured organizational succession pipelines.',
        recordingUrl: 'https://coach-lms.edu/recordings/bus101-s4.mp4',
        preReads: [
          { name: 'McKinsey: War for Talent Classic Whitepaper', url: 'https://coach-lms.edu/mckinsey-talent.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Identifying High-Potential Leaders', url: 'https://coach-lms.edu/hipo-slides.pdf' }
        ],
        postClassMaterial: [
          { name: 'Case Assignment: Succession Planning at Apple', url: 'https://coach-lms.edu/apple-succession.pdf' }
        ],
        faculty: 'Prof. Evelyn Sterling',
        programAssociate: 'Marcus Chen'
      },
      { 
        topic: 'Ethical Sourcing & Corporate Responsibility', 
        subtopic: 'Triple Bottom Line, ESG Scoring Matrices, and Greenwashing Safeguards',
        date: 'May 21', 
        time: '11:15 AM - 12:45 PM',
        status: 'U',
        type: 'Online',
        feedbackStatus: 'pending',
        objective: 'Integrate the Triple Bottom Line framework into supply chain policies and formulate audit procedures to prevent greenwashing in marketing.',
        recordingUrl: 'https://coach-lms.edu/recordings/bus101-s5.mp4',
        preReads: [
          { name: 'Elkington: Cannibals with Forks', url: 'https://coach-lms.edu/elkington-tbl.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: ESG Scoring and Compliance Audits', url: 'https://coach-lms.edu/esg-scoring.pdf' }
        ],
        postClassMaterial: [
          { name: 'Group Assignment: Corporate Social Responsibility', url: 'https://coach-lms.edu/csr-group.pdf' }
        ],
        faculty: 'Prof. Evelyn Sterling',
        programAssociate: 'Marcus Chen'
      }
    ],
    assignments: [
      { 
        id: '2_0',
        title: 'Case Study: Google Culture Analysis', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '88', 
        weight: '15%', 
        totalScore: '100', 
        grade: 'B+',
        description: 'Conduct a deep corporate culture audit focusing on Google\'s workplace norms, internal motivation systems, and the structural trade-offs between hierarchy and dynamic collaboration networks.',
        instructions: [
          'Analyze Google\'s peer-evaluation mechanisms, psychological safety indices, and workplace perks.',
          'Critique the administrative challenges associated with high employee autonomy vs centralized strategy alignment.',
          'Recommend two structural interventions to maintain alignment during global scaling phases.'
        ],
        resources: [
          { name: 'Google\'s Project Aristotle Psychological Safety study', url: 'https://rework.withgoogle.com/guides/understanding-team-effectiveness/' },
          { name: 'Organizational Behavior Case Audit Guidelines', url: 'https://coach-lms.edu/resources/ob-audit-guide.pdf' }
        ],
        rubric: [
          { criteria: 'Culture assessment and theoretical framework integration', points: '30 Pts' },
          { criteria: 'Psychological safety critique and corporate analysis', points: '45 Pts' },
          { criteria: 'Plausibility and quality of structural recommendations', points: '25 Pts' }
        ]
      },
      { 
        id: '2_1',
        title: 'Team Charter Assignment', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '94', 
        weight: '15%', 
        totalScore: '100', 
        grade: 'A',
        description: 'Establish internal team norms, communication structures, conflict resolution workflows, and accountability matrices for the upcoming semester group administrative audit projects.',
        instructions: [
          'Define detailed role profiles, skill distributions, and communication schedules for all group members.',
          'Establish step-by-step conflict escalations protocols based on the Thomas-Kilmann conflict mode framework.',
          'Outline performance metrics and self-policing accountability bounds.'
        ],
        resources: [
          { name: 'Academic Team Charter Structural Template', url: 'https://coach-lms.edu/templates/team-charter.docx' }
        ],
        rubric: [
          { criteria: 'Role definitions and structural mapping clarity', points: '30 Pts' },
          { criteria: 'Thomas-Kilmann conflict escalation protocol rigor', points: '40 Pts' },
          { criteria: 'Accountability criteria and performance metrics viability', points: '30 Pts' }
        ]
      },
      { 
        id: '2_2',
        title: 'Organizational Audit Report', 
        dueDate: 'June 02, 2026', 
        status: 'pending', 
        weight: '40%', 
        totalScore: '100',
        description: 'Draft a comprehensive administrative audit report analyzing the organizational structure of a selected mid-sized enterprise. Evaluate structural bottlenecks, ESG rating matrix alignment, and talent retention pipelines.',
        instructions: [
          'Select an active mid-market enterprise (50-500 employees).',
          'Document structural organization layout (span of control, formal hierarchy, department divides).',
          'Audit current ESG policies and design custom Triple Bottom Line metrics.',
          'Synthesize current performance appraisal reviews and outline succession planning models.'
        ],
        resources: [
          { name: 'Organizational Audit Sample Report: Retail Sector', url: 'https://coach-lms.edu/samples/retail-audit-example.pdf' },
          { name: 'ESG Scoring Guidelines and Compliance Framework', url: 'https://coach-lms.edu/compliance/esg-framework.pdf' }
        ],
        rubric: [
          { criteria: 'Corporate profiling and hierarchy auditing', points: '25 Pts' },
          { criteria: 'Triple Bottom Line & ESG analysis quality', points: '35 Pts' },
          { criteria: 'Succession planning and talent development ideas', points: '25 Pts' },
          { criteria: 'Professional report formatting and reference metrics', points: '15 Pts' }
        ]
      }
    ],
    term: 'Spring 2026',
    classType: 'InClass'
  },
  {
    id: '3',
    code: 'HCI-402',
    title: 'Human-Computer Interaction',
    topic: 'Glassmorphism & Advanced UI/UX Architecture',
    instructor: { name: 'Dr. Marcus Thorne', initials: 'MT' },
    progress: 0.88,
    grade: 'A',
    attendance: 95,
    nextClass: 'Tomorrow, 02:00 PM',
    location: 'Design Studio Lab 3',
    category: 'LAB',
    status: 'in-progress',
    color: '#4CAF50', // Green
    objective: 'Examines cognitive paradigms in UI/UX architecture. Focuses on spatial layout design, micro-interaction modeling, accessibility compliance, and tactile feedback patterns.',
    evaluationCriteria: [
      { name: 'Interactive Prototyping', weight: '40%' },
      { name: 'Empirical Usability Study', weight: '30%' },
      { name: 'Accessibility Audit Suite', weight: '20%' },
      { name: 'Lab Logbooks', weight: '10%' }
    ],
    sessions: [
      { 
        topic: 'Affordances, Signifiers & Mental Models', 
        subtopic: 'Norman Doors, Conceptual Models, and Cognitive Mappings',
        date: 'May 06', 
        time: '02:00 PM - 03:30 PM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'submitted',
        objective: 'Apply the concepts of affordances and signifiers to identify conceptual model mismatches in everyday digital interfaces.',
        recordingUrl: 'https://coach-lms.edu/recordings/hci402-s1.mp4',
        preReads: [
          { name: 'Norman: The Design of Everyday Things Ch 1', url: 'https://coach-lms.edu/norman-ch1.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Conceptual Models & Mappings', url: 'https://coach-lms.edu/conceptual-models.pdf' }
        ],
        postClassMaterial: [
          { name: 'Figma: Mapping Redesigns for Unintuitive Forms', url: 'https://figma.com/file/redesign' }
        ],
        faculty: 'Dr. Marcus Thorne',
        programAssociate: 'Kelly Peterson'
      },
      { 
        topic: 'Fitts Law & Gestalt Design Principles', 
        subtopic: 'Target Acquisition Models, Proximity, Similarity, and Common Fate',
        date: 'May 09', 
        time: '02:00 PM - 03:30 PM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'submitted',
        objective: 'Model target acquisition speeds using Fitts Law equations and design navigation components leveraging Gestalt grouping laws.',
        recordingUrl: 'https://coach-lms.edu/recordings/hci402-s2.mp4',
        preReads: [
          { name: 'Gestalt Grouping Principles in Screen Designs', url: 'https://coach-lms.edu/gestalt.pdf' }
        ],
        inClassMaterial: [
          { name: 'Interactive Fitts Law Tester Tool', url: 'https://coach-lms.edu/fitts-tester' }
        ],
        postClassMaterial: [
          { name: 'Lab Homework: Target Layout Calculations', url: 'https://coach-lms.edu/hci402-lab2.pdf' }
        ],
        faculty: 'Dr. Marcus Thorne',
        programAssociate: 'Kelly Peterson'
      },
      { 
        topic: 'Heuristic Evaluation & Usability Auditing', 
        subtopic: 'Nielsen 10 Usability Heuristics, Severity Ratings, and Auditing Logs',
        date: 'May 13', 
        time: '02:00 PM - 03:30 PM',
        status: 'P',
        type: 'Hybrid',
        feedbackStatus: 'submitted',
        objective: 'Conduct a formal heuristic evaluation of a live web platform utilizing Nielsen\'s 10 rules and compile severity-rated audit logs.',
        recordingUrl: 'https://coach-lms.edu/recordings/hci402-s3.mp4',
        preReads: [
          { name: 'Nielsen: Heuristic Evaluation of UIs Guide', url: 'https://nielsen-heuristics.pdf' }
        ],
        inClassMaterial: [
          { name: 'Group Activity: Auditing Checkout Funnels', url: 'https://coach-lms.edu/funnel-activity.pdf' }
        ],
        postClassMaterial: [
          { name: 'Individual Heuristic Audit Report', url: 'https://coach-lms.edu/hci-audit-report.pdf' }
        ],
        faculty: 'Dr. Marcus Thorne',
        programAssociate: 'Kelly Peterson'
      },
      { 
        topic: 'Motion Choreography & Spatial Layouts', 
        subtopic: 'Easing Curves, Dynamic Overlays, Layering, and Spatial Anchoring',
        date: 'May 16', 
        time: '02:00 PM - 03:30 PM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'pending',
        objective: 'Design smooth motion choreography using custom cubic-bezier curves to preserve user spatial awareness across route transitions.',
        recordingUrl: 'https://coach-lms.edu/recordings/hci402-s4.mp4',
        preReads: [
          { name: 'Material Design: Motion Choreography', url: 'https://material.io/motion' }
        ],
        inClassMaterial: [
          { name: 'Figma Lab: Easing Curves & Spatial Maps', url: 'https://figma.com/file/easing' }
        ],
        postClassMaterial: [
          { name: 'Motion Code Implementation: Reanimated 2', url: 'https://coach-lms.edu/reanimated-motion.pdf' }
        ],
        faculty: 'Dr. Marcus Thorne',
        programAssociate: 'Kelly Peterson'
      },
      { 
        topic: 'Custom Micro-interactions & Prototyping', 
        subtopic: 'Feedback Loops, State Transitions, Lottie Animations, and Tactile Triggers',
        date: 'May 20', 
        time: '02:00 PM - 03:30 PM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'pending',
        objective: 'Construct responsive micro-interactions with Lottie vectors and tactile haptics to establish clear interaction feedback loops.',
        recordingUrl: 'https://coach-lms.edu/recordings/hci402-s5.mp4',
        preReads: [
          { name: 'Saffer: Microinteractions Ch 1-2', url: 'https://coach-lms.edu/saffer-micro.pdf' }
        ],
        inClassMaterial: [
          { name: 'Lab: Figma variables & triggers', url: 'https://figma.com/file/variables' }
        ],
        postClassMaterial: [
          { name: 'Final Prototype Review Submission File', url: 'https://coach-lms.edu/final-prototype' }
        ],
        faculty: 'Dr. Marcus Thorne',
        programAssociate: 'Kelly Peterson'
      }
    ],
    assignments: [
      { 
        id: '3_0',
        title: 'Interactive Prototype Pitch', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '100', 
        weight: '20%', 
        totalScore: '100', 
        grade: 'A+',
        description: 'Develop a high-fidelity interactive prototype in Figma or Framer showcasing modern spatial layouts, easing curves, and tactile micro-interactions. Present your design architecture in a formal 5-minute video pitch.',
        instructions: [
          'Construct a user interface exhibiting premium layout structures (e.g. glassmorphism overlays, dynamic menus).',
          'Establish custom motion choreography using precise easing curves (e.g., cubic-bezier equations) for transitions.',
          'Model responsive micro-interactions (e.g. button state feedback loops, subtle hover haptics).'
        ],
        resources: [
          { name: 'HCI Figma Styling Tokens and Component library', url: 'https://figma.com/files/hci-styling-library' },
          { name: 'Effective UX Prototyping Pitches Checklist', url: 'https://coach-lms.edu/resources/ux-pitch-checklist.pdf' }
        ],
        rubric: [
          { criteria: 'UI visual design standard and premium aesthetics', points: '40 Pts' },
          { criteria: 'Motion choreography and transition transitions smoothness', points: '30 Pts' },
          { criteria: 'Pitch clarity, visual flow, and user problem mapping', points: '30 Pts' }
        ]
      },
      { 
        id: '3_1',
        title: 'Cognitive Walkthrough Matrix', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '96', 
        weight: '20%', 
        totalScore: '100', 
        grade: 'A',
        description: 'Perform a systematic cognitive walkthrough for a complex multi-step mobile workflow. Document user subgoals, execution actions, and potential conceptual model failures.',
        instructions: [
          'Deconstruct a mobile user journey (e.g., subscription checkout, custom profile setups) into individual discrete steps.',
          'Evaluate each action against Norman\'s execution/evaluation gulfs.',
          'Formulate severity-rated tables documenting cognitive friction points.'
        ],
        resources: [
          { name: 'Mobile Cognitive Walkthrough Matrix Template', url: 'https://coach-lms.edu/templates/cognitive-walkthrough.xlsx' }
        ],
        rubric: [
          { criteria: 'Journey deconstruction granularity and user step parsing', points: '30 Pts' },
          { criteria: 'Gulf of Execution/Evaluation mapping depth', points: '40 Pts' },
          { criteria: 'Heuristic recommendations and severity scales', points: '30 Pts' }
        ]
      },
      { 
        id: '3_2',
        title: 'Accessibility Audit Suite', 
        dueDate: 'May 30, 2026', 
        status: 'pending', 
        weight: '20%', 
        totalScore: '100',
        description: 'Perform a comprehensive digital accessibility audit on a public web application against WCAG 2.2 AA standards. Identify compliance failures and compose technical remediation code snippets.',
        instructions: [
          'Audit high-traffic user patterns using screen readers and keyboard-only inputs.',
          'Identify color contrast failures, missing aria attributes, non-semantic headings, and touch target size infractions.',
          'Write drop-in HTML/CSS/React correction snippets resolving detected issues.'
        ],
        resources: [
          { name: 'WCAG 2.2 AA Compliance Quick Reference', url: 'https://www.w3.org/WAI/WCAG22/quickref/' },
          { name: 'Accessibility Audit Log Sample Template', url: 'https://coach-lms.edu/templates/accessibility-audit.pdf' }
        ],
        rubric: [
          { criteria: 'WCAG violation identification accuracy', points: '30 Pts' },
          { criteria: 'Audit reporting structure and severity categorizations', points: '30 Pts' },
          { criteria: 'Remediation code viability and technical completeness', points: '40 Pts' }
        ]
      }
    ],
    term: 'Fall 2025',
    classType: 'OutClass'
  },
  {
    id: '4',
    code: 'CS-210',
    title: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming & Graph Theory',
    instructor: { name: 'Dr. Alan Turing Jr.', initials: 'AT' },
    progress: 1.0,
    grade: 'A',
    attendance: 98,
    nextClass: 'Term Finished',
    location: 'Online Portal',
    category: 'VIRTUAL',
    status: 'completed',
    color: '#FFE500', // Yellow
    objective: 'Implements advanced computational algorithms. Focuses on amortized asymptotic complexity, dynamic programming optimizations, graph traversals, and network flows.',
    evaluationCriteria: [
      { name: 'Programming Assessments', weight: '50%' },
      { name: 'Algorithms Exam', weight: '30%' },
      { name: 'Dynamic Programming Lab', weight: '20%' }
    ],
    sessions: [
      { 
        topic: 'Divide & Conquer: Master Theorem', 
        subtopic: 'Recurrence Relations, Recursion Trees, and Master Method Bounds',
        date: 'April 12', 
        time: '04:00 PM - 05:30 PM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'submitted',
        objective: 'Deconstruct recurrence relations and prove exact asymptotic complexity bounds using the Master Theorem cases.',
        recordingUrl: 'https://coach-lms.edu/recordings/cs210-s1.mp4',
        preReads: [
          { name: 'CLRS Ch 4: Divide-and-Conquer Recurrences', url: 'https://coach-lms.edu/clrs-ch4.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: Master Theorem Recurrences', url: 'https://coach-lms.edu/master-theorem.pdf' }
        ],
        postClassMaterial: [
          { name: 'Lab 1: Recursion Tree Visualizer', url: 'https://github.com/coach/visualizer' }
        ],
        faculty: 'Dr. Alan Turing Jr.',
        programAssociate: 'Venkatesh Prasad'
      },
      { 
        topic: 'Red-Black Trees & Treaps Complexity', 
        subtopic: 'Rotation Rules, Balance Constraints, and Randomized Search structures',
        date: 'April 15', 
        time: '04:00 PM - 05:30 PM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'submitted',
        objective: 'Implement left-right tree rotations and prove dynamic balance boundaries for red-black trees and randomized treaps.',
        recordingUrl: 'https://coach-lms.edu/recordings/cs210-s2.mp4',
        preReads: [
          { name: 'CLRS Ch 13: Red-Black Balanced Trees', url: 'https://coach-lms.edu/clrs-ch13.pdf' }
        ],
        inClassMaterial: [
          { name: 'Tree Rotation Simulator Board', url: 'https://coach-lms.edu/tree-rotations' }
        ],
        postClassMaterial: [
          { name: 'Programming Lab 2: RB-Tree Deletion', url: 'https://github.com/coach/rbtree-lab' }
        ],
        faculty: 'Dr. Alan Turing Jr.',
        programAssociate: 'Venkatesh Prasad'
      },
      { 
        topic: 'Dynamic Programming Optimizations', 
        subtopic: 'Memoization vs Tabulation, Knapsack variations, and Optimal Substructure',
        date: 'April 19', 
        time: '04:00 PM - 05:30 PM',
        status: 'P',
        type: 'Hybrid',
        feedbackStatus: 'submitted',
        objective: 'Construct linear recurrence relations for dynamic program sub-problems and optimize spatial requirements through grid state truncation.',
        recordingUrl: 'https://coach-lms.edu/recordings/cs210-s3.mp4',
        preReads: [
          { name: 'CLRS Ch 15: Dynamic Programming Concepts', url: 'https://coach-lms.edu/clrs-ch15.pdf' }
        ],
        inClassMaterial: [
          { name: 'Workbook: Knapsack Transition Equations', url: 'https://coach-lms.edu/knapsack-matrix.pdf' }
        ],
        postClassMaterial: [
          { name: 'Programming Lab 3: Optimal Matrix Multiplier', url: 'https://github.com/coach/matrix-dp' }
        ],
        faculty: 'Dr. Alan Turing Jr.',
        programAssociate: 'Venkatesh Prasad'
      },
      { 
        topic: 'Shortest Paths: Bellman-Ford & Floyd-Warshall', 
        subtopic: 'Edge Relaxation, Negative Weight Cycles, and All-Pairs Matrix updates',
        date: 'April 22', 
        time: '04:00 PM - 05:30 PM',
        status: 'P',
        type: 'Online',
        feedbackStatus: 'submitted',
        objective: 'Analyze negative edge weights in graphs using the Bellman-Ford algorithm and implement the Floyd-Warshall algorithm for all-pairs calculations.',
        recordingUrl: 'https://coach-lms.edu/recordings/cs210-s4.mp4',
        preReads: [
          { name: 'CLRS Ch 24-25: Shortest Paths', url: 'https://coach-lms.edu/clrs-ch24.pdf' }
        ],
        inClassMaterial: [
          { name: 'Slides: All-Pairs Relaxation Updates', url: 'https://coach-lms.edu/all-pairs.pdf' }
        ],
        postClassMaterial: [
          { name: 'Programming Lab 4: Parallel Floyd-Warshall', url: 'https://github.com/coach/floyd-parallel' }
        ],
        faculty: 'Dr. Alan Turing Jr.',
        programAssociate: 'Venkatesh Prasad'
      },
      { 
        topic: 'Ford-Fulkerson Network Maximum Flow', 
        subtopic: 'Residual Capacity Networks, Augmenting Paths, and Min-Cut Max-Flow Theorem',
        date: 'April 26', 
        time: '04:00 PM - 05:30 PM',
        status: 'P',
        type: 'Offline',
        feedbackStatus: 'submitted',
        objective: 'Apply the Ford-Fulkerson method and Edmonds-Karp BFS enhancement to calculate maximum networks capacity and prove duality of the Min-Cut Max-Flow theorem.',
        recordingUrl: 'https://coach-lms.edu/recordings/cs210-s5.mp4',
        preReads: [
          { name: 'CLRS Ch 26: Network Maximum Flow Theory', url: 'https://coach-lms.edu/clrs-ch26.pdf' }
        ],
        inClassMaterial: [
          { name: 'Network Max Flow Simulator Sandbox', url: 'https://coach-lms.edu/flow-sandbox' }
        ],
        postClassMaterial: [
          { name: 'Final Algorithms Assessment Sample', url: 'https://coach-lms.edu/final-sample.pdf' }
        ],
        faculty: 'Dr. Alan Turing Jr.',
        programAssociate: 'Venkatesh Prasad'
      }
    ],
    assignments: [
      { 
        id: '4_0',
        title: 'Algorithmic Efficiency Labs 1-4', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '98', 
        weight: '25%', 
        totalScore: '100', 
        grade: 'A+',
        description: 'Write optimized dynamic algorithms in C++ or Python and analyze their asymptotic time/space complexities. Focus on Divide & Conquer recurrences and Master Theorem proofs.',
        instructions: [
          'Code highly optimized divide and conquer systems for 2D closest-pair problems.',
          'Demonstrate mathematical bounds for all recurrences using exact recursion tree models.',
          'Optimize execution paths to achieve strict O(N log N) asymptotic upper bounds.'
        ],
        resources: [
          { name: 'CLRS Solutions Chapter 4 Reference', url: 'https://coach-lms.edu/resources/clrs-ch4-solutions.pdf' }
        ],
        rubric: [
          { criteria: 'Asymptotic proof mathematical completeness', points: '35 Pts' },
          { criteria: 'Algorithm optimization level and code formatting', points: '45 Pts' },
          { criteria: 'Test coverage and edge-case boundary checks', points: '20 Pts' }
        ]
      },
      { 
        id: '4_1',
        title: 'Dynamic Knapsack Solver Implementation', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '100', 
        weight: '25%', 
        totalScore: '100', 
        grade: 'A+',
        description: 'Design and deploy dynamic programming solvers for multi-dimensional knapsack allocation problems. Implement spatial table truncation optimizations to preserve system memory constraints.',
        instructions: [
          'Construct exact linear state transition equations for knapsack grid states.',
          'Implement tabulation solvers utilizing memoization caching structures.',
          'Reduce standard dynamic programming grid spatial overhead from O(N * W) to O(W) using state truncations.'
        ],
        resources: [
          { name: 'Dynamic Programming Optimization Cheat Sheet', url: 'https://coach-lms.edu/cheatsheets/dp-optimizations.pdf' }
        ],
        rubric: [
          { criteria: 'State transition equation mathematical precision', points: '30 Pts' },
          { criteria: 'Memoization caching logic implementation soundness', points: '40 Pts' },
          { criteria: 'Spatial memory complexity reduction to O(W)', points: '30 Pts' }
        ]
      },
      { 
        id: '4_2',
        title: 'B-Tree Implementation Challenge', 
        dueDate: 'Completed', 
        status: 'submitted', 
        score: '95', 
        weight: '25%', 
        totalScore: '100', 
        grade: 'A',
        description: 'Code a fully functioning B-Tree storage engine index structures supporting node insertions, deletions, search lookups, and split/merge operations in secondary memory files.',
        instructions: [
          'Implement node structural divides holding array blocks of keys, values, and child pointers.',
          'Code search and insert algorithms resolving overflows with preemptive split calls.',
          'Code deletion algorithms resolving underflows with borrow or merge strategies.'
        ],
        resources: [
          { name: 'B-Tree Splitting & Merging Mechanics Handout', url: 'https://coach-lms.edu/handouts/btree-mechanics.pdf' },
          { name: 'Data Engine Benchmark Test Suites', url: 'https://github.com/coach/btree-benchmark' }
        ],
        rubric: [
          { criteria: 'B-Tree class structural definitions', points: '25 Pts' },
          { criteria: 'Insert split and delete merge algorithm validity', points: '45 Pts' },
          { criteria: 'Concurrency safety lock setups', points: '20 Pts' },
          { criteria: 'Disk file indexing and speed efficiency', points: '10 Pts' }
        ]
      }
    ],
    term: 'Fall 2025',
    classType: 'OutClass'
  }
];
