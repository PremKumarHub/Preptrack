import Question from '../models/Question.js';

const COMPANIES = [
  { id: 'tcs', name: 'TCS', logo: 'TCS', pattern: 'TCS NQT', rounds: ['Aptitude', 'Coding', 'TR', 'HR'], color: '#0047AB', focus: 'Aptitude-heavy with basic DSA and communication rounds.' },
  { id: 'infosys', name: 'Infosys', logo: 'Infy', pattern: 'InfyTQ + HackWithInfy', rounds: ['Online Test', 'TR', 'HR'], color: '#0078C8', focus: 'Strong fundamentals, pseudo-code, and problem-solving under time pressure.' },
  { id: 'zoho', name: 'Zoho', logo: 'Zoho', pattern: 'Problem Solving Heavy', rounds: ['Written', 'Coding', 'Technical', 'HR'], color: '#C8282B', focus: 'Deep logic, coding efficiency, and practical engineering thinking.' },
  { id: 'wipro', name: 'Wipro', logo: 'Wipro', pattern: 'NLTH Pattern', rounds: ['Online', 'Essay', 'TR', 'HR'], color: '#341D50', focus: 'Communication, essay writing, and core CS fundamentals.' },
  { id: 'freshworks', name: 'Freshworks', logo: 'FW', pattern: 'Product-focused DSA', rounds: ['DSA', 'System Design', 'Culture Fit'], color: '#29B35E', focus: 'Product mindset, clean code, and scalable thinking.' },
  { id: 'cognizant', name: 'Cognizant', logo: 'CTS', pattern: 'GenC Track', rounds: ['Aptitude', 'Coding', 'TR', 'HR'], color: '#1264A3', focus: 'Aptitude, basic programming, and role-fit behavioral questions.' },
  { id: 'amazon', name: 'Amazon', logo: 'AMZ', pattern: 'SDE Rounds', rounds: ['OA', 'DSA 1', 'DSA 2', 'Bar Raiser'], color: '#FF9900', focus: 'Leadership Principles and heavy DSA/System Design.' },
  { id: 'accenture', name: 'Accenture', logo: 'ACC', pattern: 'ASE/SDE Track', rounds: ['Cognitive', 'Technical', 'HR'], color: '#A100FF', focus: 'Cognitive ability, basic coding, and professional communication.' },
  { id: 'hcl', name: 'HCL', logo: 'HCL', pattern: 'First Career', rounds: ['Online Test', 'Technical', 'HR'], color: '#005697', focus: 'Domain knowledge and technical fundamentals.' },
];

export async function listCompanies(_req, res) {
  res.json({ companies: COMPANIES });
}

export async function getCompany(req, res) {
  const company = COMPANIES.find((item) => item.id === req.params.id.toLowerCase());
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }
  res.json({ company });
}

export async function getCompanyQuestions(req, res, next) {
  try {
    const companyId = req.params.id.toLowerCase();
    const company = COMPANIES.find((item) => item.id === companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const role = req.query.role || req.user.role;
    const questions = await Question.find({
      companies: companyId,
      role: role.toLowerCase(),
    }).sort({ topic: 1, difficulty: 1, createdAt: 1 });

    res.json({ company, questions });
  } catch (error) {
    next(error);
  }
}
