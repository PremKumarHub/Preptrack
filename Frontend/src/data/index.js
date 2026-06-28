export const roles = [
  { id: 'mern', label: 'MERN Stack', icon: 'JS', color: '#3B82F6', topics: 9, questions: 120, companies: ['Zoho', 'Freshworks', 'Chargebee'] },
  { id: 'java', label: 'Java Developer', icon: 'JV', color: '#F59E0B', topics: 8, questions: 95, companies: ['TCS', 'Infosys', 'Wipro'] },
  { id: 'python', label: 'Python Developer', icon: 'PY', color: '#10B981', topics: 7, questions: 88, companies: ['Cognizant', 'HCL', 'Accenture'] },
  { id: 'frontend', label: 'Frontend Dev', icon: 'UI', color: '#8B5CF6', topics: 7, questions: 75, companies: ['Swiggy', 'BYJU\'S', 'Urban Company'] },
  { id: 'data', label: 'Data Analyst', icon: 'DA', color: '#EF4444', topics: 6, questions: 70, companies: ['Mu Sigma', 'Fractal', 'Tiger Analytics'] },
  { id: 'devops', label: 'DevOps Engineer', icon: 'DO', color: '#06B6D4', topics: 6, questions: 60, companies: ['Amazon', 'Mindtree', 'Mphasis'] },
];

export const companies = [
  { id: 'tcs', name: 'TCS', logo: 'TCS', pattern: 'TCS NQT', rounds: ['Aptitude', 'Coding', 'TR', 'HR'], color: '#0047AB' },
  { id: 'infosys', name: 'Infosys', logo: 'Infy', pattern: 'InfyTQ + HackWithInfy', rounds: ['Online Test', 'TR', 'HR'], color: '#0078C8' },
  { id: 'zoho', name: 'Zoho', logo: 'Zoho', pattern: 'Problem Solving Heavy', rounds: ['Written', 'Coding', 'Technical', 'HR'], color: '#C8282B' },
  { id: 'wipro', name: 'Wipro', logo: 'Wipro', pattern: 'NLTH Pattern', rounds: ['Online', 'Essay', 'TR', 'HR'], color: '#341D50' },
  { id: 'freshworks', name: 'Freshworks', logo: 'FW', pattern: 'Product-focused DSA', rounds: ['DSA', 'System Design', 'Culture Fit'], color: '#29B35E' },
  { id: 'cognizant', name: 'Cognizant', logo: 'CTS', pattern: 'GenC Track', rounds: ['Aptitude', 'Coding', 'TR', 'HR'], color: '#1264A3' },
];

export const mockQuestions = {
  mern: [
    { id: 'm1', q: 'Explain the Virtual DOM in React and how it improves performance.', topic: 'React', difficulty: 'Medium', hint: 'Talk about diffing algorithm and reconciliation.' },
    { id: 'm2', q: 'What is middleware in Express.js? Give a real-world use case.', topic: 'Node.js', difficulty: 'Easy', hint: 'Think about authentication, logging, error handling.' },
    { id: 'm3', q: 'How does JWT authentication work? Explain the full flow.', topic: 'Auth', difficulty: 'Medium', hint: 'Cover token creation, signing, verification and refresh tokens.' },
    { id: 'm4', q: 'What is the difference between SQL and NoSQL? When would you choose MongoDB?', topic: 'MongoDB', difficulty: 'Easy', hint: 'Think about schema flexibility, scalability, use cases.' },
    { id: 'm5', q: 'Explain useEffect cleanup function with an example.', topic: 'React', difficulty: 'Medium', hint: 'Think about subscriptions, timers, event listeners.' },
    { id: 'm6', q: 'How do you handle CORS in a Node.js/Express backend?', topic: 'Node.js', difficulty: 'Easy', hint: 'Mention the cors npm package and manual headers.' },
    { id: 'm7', q: 'What is Redux and when should you use it over Context API?', topic: 'React', difficulty: 'Hard', hint: 'Consider app scale, complexity, devtools, performance.' },
    { id: 'm8', q: 'Explain the concept of event loop in Node.js.', topic: 'Node.js', difficulty: 'Hard', hint: 'Cover call stack, callback queue, microtask queue.' },
    { id: 'm9', q: 'Find the middle element of a Linked List.', topic: 'DSA', difficulty: 'Easy', hint: 'Use the fast and slow pointer approach.', practiceUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
    { id: 'm10', q: 'Implement a Stack using Queues.', topic: 'DSA', difficulty: 'Medium', hint: 'You can use two queues or one with rotation.', practiceUrl: 'https://leetcode.com/problems/implement-stack-using-queues/' },
  ],
  hr: [
    { id: 'h1', q: 'Tell me about yourself.', topic: 'Introduction', difficulty: 'Easy', hint: 'Keep it 90 seconds: education, skills, projects, and why this role.' },
    { id: 'h2', q: 'Why do you want to join this company?', topic: 'Motivation', difficulty: 'Easy', hint: 'Research the company. Mention specific product, values, growth.' },
    { id: 'h3', q: 'Where do you see yourself in 5 years?', topic: 'Career Goals', difficulty: 'Medium', hint: 'Show ambition and alignment with the company trajectory.' },
    { id: 'h4', q: 'What is your greatest strength and weakness?', topic: 'Self-Awareness', difficulty: 'Medium', hint: 'Be genuine. For weakness, show what you are doing to improve.' },
    { id: 'h5', q: 'Describe a challenging project and how you handled it.', topic: 'Behavioral', difficulty: 'Medium', hint: 'Use STAR: Situation, Task, Action, Result.' },
  ],
};

export const topicsByRole = {
  mern: [
    { name: 'JavaScript Fundamentals', questions: 18, done: 18, difficulty: 'Easy' },
    { name: 'React Core Concepts', questions: 22, done: 15, difficulty: 'Medium' },
    { name: 'Node.js & Express', questions: 20, done: 10, difficulty: 'Medium' },
    { name: 'MongoDB & Mongoose', questions: 15, done: 4, difficulty: 'Medium' },
    { name: 'REST API Design', questions: 12, done: 0, difficulty: 'Medium' },
    { name: 'Authentication (JWT)', questions: 10, done: 0, difficulty: 'Hard' },
    { name: 'DSA in JavaScript', questions: 30, done: 0, difficulty: 'Hard' },
    { name: 'System Design Basics', questions: 8, done: 0, difficulty: 'Hard' },
    { name: 'HR & Behavioral', questions: 20, done: 0, difficulty: 'Easy' },
  ],
};
