-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT NOT NULL,
  key_requirements TEXT,
  recruiter_name TEXT DEFAULT 'Not Found',
  recruiter_linkedin TEXT DEFAULT 'Not Found',
  hiring_manager_name TEXT DEFAULT 'Not Found',
  hiring_manager_linkedin TEXT DEFAULT 'Not Found',
  tailored_resume TEXT,
  status TEXT DEFAULT 'Saved' CHECK (status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  source TEXT DEFAULT 'manual',
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracker runs log
CREATE TABLE IF NOT EXISTS tracker_runs (
  id SERIAL PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT NOW(),
  jobs_found INTEGER DEFAULT 0,
  new_jobs_added INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  log TEXT
);

-- Seed 15 original jobs
INSERT INTO jobs (company, job_title, job_url, key_requirements, recruiter_name, recruiter_linkedin, hiring_manager_name, hiring_manager_linkedin, tailored_resume, status, source) VALUES
('Grab', 'Senior Product Manager - Payments', 'https://grab.careers/jobs/senior-pm-payments', '5+ years PM experience, payments/fintech background, SQL proficiency, stakeholder management, Agile/Scrum', 'Sarah Tan', 'https://linkedin.com/in/sarahtan', 'David Lim', 'https://linkedin.com/in/davidlim', '## Tailored Resume for Grab\n\n**Key Highlights:**\n- 7+ years in product management across fintech and payments\n- Led payment gateway integration serving 2M+ users\n- Deep APAC market experience across Singapore, Indonesia, and Malaysia\n- Proven track record in stakeholder management with C-suite executives', 'Applied', 'manual'),

('Shopee', 'Lead Product Manager - Marketplace', 'https://careers.shopee.sg/lead-pm-marketplace', '7+ years PM experience, marketplace/e-commerce, data-driven decision making, cross-functional leadership, A/B testing', 'Michael Wong', 'https://linkedin.com/in/michaelwong', 'Lisa Chen', 'https://linkedin.com/in/lisachen', '## Tailored Resume for Shopee\n\n**Key Highlights:**\n- Built and scaled marketplace features reaching 5M+ monthly active users\n- Expert in A/B testing and data-driven product decisions\n- Cross-functional leadership across engineering, design, and operations\n- Experience optimizing seller onboarding funnels (40% improvement)', 'Interview', 'manual'),

('Stripe', 'Product Manager - APAC Expansion', 'https://stripe.com/jobs/pm-apac', '5+ years PM, payments infrastructure, API product experience, international expansion, technical background', 'James Lee', 'https://linkedin.com/in/jameslee', 'Rachel Kim', 'https://linkedin.com/in/rachelkim', '## Tailored Resume for Stripe\n\n**Key Highlights:**\n- Deep payments infrastructure knowledge across card processing and alternative payments\n- API-first product development experience\n- Led APAC expansion for fintech platform across 5 markets\n- Strong technical background with hands-on engineering experience', 'Saved', 'manual'),

('Wise', 'Senior Product Manager - Send Money', 'https://wise.jobs/pm-send-money', '5+ years PM, cross-border payments, mobile-first products, regulatory knowledge, growth metrics', 'Amanda Koh', 'https://linkedin.com/in/amandakoh', 'Not Found', 'Not Found', NULL, 'Saved', 'manual'),

('GoTo Financial', 'Head of Product - Lending', 'https://goto.com/careers/head-product-lending', '10+ years PM, lending/credit products, P&L ownership, team leadership 10+, regulatory experience SEA', 'Ryan Teo', 'https://linkedin.com/in/ryanteo', 'Chris Patel', 'https://linkedin.com/in/chrispatel', NULL, 'Saved', 'manual'),

('Revolut', 'Product Manager - Cards', 'https://revolut.com/careers/pm-cards', '4+ years PM, card issuing/processing, compliance knowledge, fast-paced environment, user research', 'Not Found', 'Not Found', 'Maria Santos', 'https://linkedin.com/in/mariasantos', '## Tailored Resume for Revolut\n\n**Key Highlights:**\n- Managed card product lifecycle from issuance to transaction processing\n- Knowledge of PCI-DSS compliance and card scheme regulations\n- Experience with rapid iteration in high-growth fintech\n- User research-driven product development approach', 'Applied', 'manual'),

('Sea Money', 'Senior PM - Digital Banking', 'https://sea.com/careers/pm-digital-banking', '6+ years PM, digital banking, KYC/AML, mobile banking apps, SEA market knowledge', 'Diana Chua', 'https://linkedin.com/in/dianachua', 'Kevin Ng', 'https://linkedin.com/in/kevinng', NULL, 'Saved', 'manual'),

('Ant Group', 'Product Lead - International', 'https://antgroup.com/careers/product-lead-intl', '8+ years PM, international payments, Alipay+ ecosystem, China-SEA corridor, partnership management', 'Not Found', 'Not Found', 'Not Found', 'Not Found', NULL, 'Saved', 'manual'),

('Standard Chartered', 'VP Product - Digital Platforms', 'https://sc.com/careers/vp-product-digital', '10+ years, digital transformation banking, platform strategy, vendor management, enterprise product', 'Jennifer Yap', 'https://linkedin.com/in/jenniferyap', 'Thomas Lau', 'https://linkedin.com/in/thomaslau', '## Tailored Resume for Standard Chartered\n\n**Key Highlights:**\n- Led digital transformation initiatives in financial services\n- Platform strategy experience connecting multiple business units\n- Enterprise-grade product management with compliance focus\n- Vendor management and partnership development across APAC', 'Interview', 'manual'),

('Endowus', 'Product Manager - Wealth Platform', 'https://endowus.com/careers/pm-wealth', '4+ years PM, wealth management/robo-advisory, Singapore CPF/SRS knowledge, fintech regulation', 'Siti Rahman', 'https://linkedin.com/in/sitirahman', 'Not Found', 'Not Found', NULL, 'Saved', 'manual'),

('Funding Societies', 'Senior PM - SME Lending', 'https://fundingsocieties.com/careers/sr-pm-lending', '5+ years PM, SME lending, credit risk products, marketplace lending, SEA expansion', 'Alex Goh', 'https://linkedin.com/in/alexgoh', 'Priya Sharma', 'https://linkedin.com/in/priyasharma', NULL, 'Applied', 'manual'),

('Xendit', 'Product Manager - Payment Gateway', 'https://xendit.co/careers/pm-payment-gateway', '4+ years PM, payment gateway, API products, developer experience, Indonesia/Philippines market', 'Not Found', 'Not Found', 'Daniel Wirawan', 'https://linkedin.com/in/danielwirawan', '## Tailored Resume for Xendit\n\n**Key Highlights:**\n- Built payment gateway products processing $500M+ annually\n- Developer experience focus with API-first design\n- Deep understanding of SEA payment landscape\n- Experience with merchant onboarding and integration support', 'Saved', 'manual'),

('Aspire', 'Lead PM - Business Accounts', 'https://aspireapp.com/careers/lead-pm-accounts', '6+ years PM, business banking, expense management, card programs, SME market', 'Michelle Tan', 'https://linkedin.com/in/michelletansg', 'Not Found', 'Not Found', NULL, 'Saved', 'manual'),

('Fazz (formerly Xfers)', 'Senior PM - Embedded Finance', 'https://fazz.com/careers/sr-pm-embedded-finance', '5+ years PM, embedded finance, BaaS/APIs, partner integrations, compliance SEA', 'Raymond Lim', 'https://linkedin.com/in/raymondlim', 'Jasmine Ong', 'https://linkedin.com/in/jasmineong', NULL, 'Rejected', 'manual'),

('Atome', 'Product Manager - BNPL', 'https://atome.sg/careers/pm-bnpl', '4+ years PM, BNPL/consumer lending, merchant partnerships, credit scoring, growth loops', 'Not Found', 'Not Found', 'Not Found', 'Not Found', NULL, 'Offer', 'manual');
