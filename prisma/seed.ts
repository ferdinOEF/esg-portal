import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedFrameworks() {
  await prisma.framework.upsert({
    where: { code: 'SDG' },
    update: {},
    create: {
      code: 'SDG',
      title: 'UN Sustainable Development Goals',
      description: 'Mapping company actions to relevant SDG targets.',
      requirements: {
        create: [
          {
            code: 'SDG-12',
            title: 'Responsible Consumption & Production',
            description: 'Waste reduction and circularity practices',
          },
          {
            code: 'SDG-13',
            title: 'Climate Action',
            description: 'GHG inventory and mitigation plan',
          },
          {
            code: 'SDG-14',
            title: 'Life Below Water',
            description: 'Marine impact mitigation',
          },
        ],
      },
    },
  });

  await prisma.framework.upsert({
    where: { code: 'TCFD' },
    update: {},
    create: {
      code: 'TCFD',
      title: 'Task Force on Climate-related Financial Disclosures',
      description: 'Governance, Strategy, Risk Management, Metrics & Targets',
      requirements: {
        create: [
          { code: 'TCFD-G', title: 'Governance', description: 'Board oversight of climate risks' },
          { code: 'TCFD-S', title: 'Strategy', description: 'Scenario analysis and resilience' },
          { code: 'TCFD-R', title: 'Risk Management', description: 'Processes to identify, assess, manage risks' },
          { code: 'TCFD-MT', title: 'Metrics & Targets', description: 'GHG metrics and targets' },
        ],
      },
    },
  });

  console.log('Frameworks seeded');
}

async function seedSchemes() {
  const schemes = [
    {
      code: 'BRSR',
      title: 'Business Responsibility and Sustainability Reporting',
      category: 'Regulatory Frameworks',
      issuingAuthority: 'SEBI (India)',
      mandatory: true,
      description:
        'BRSR is the sustainability reporting framework mandated by SEBI for listed entities in India, covering environmental, social, and governance disclosures.',
      eligibility:
        'Applies to listed entities in India as per SEBI’s applicability thresholds. MSMEs interfacing with listed buyers may align voluntarily for supply-chain readiness.',
      process:
        'Collect ESG data across the nine principles, compile metrics as per BRSR format, ensure board oversight, and file alongside annual reports per SEBI timelines.',
      benefits:
        'Investor transparency, supply-chain credibility, regulatory readiness, improved stakeholder trust.',
      deadlines: 'Aligned with financial year annual report timelines as per SEBI circulars.',
      features: [
        'Principle-wise ESG disclosures',
        'Quantitative KPIs and E/S/G indicators',
        'Board oversight and governance emphasis',
      ],
      tags: ['reporting', 'regulatory', 'ESG'],
      references: [
        {
          label: 'BRSR Annexure (uploaded PDF)',
          filename: 'Business responsibility and sustainability reporting by listed entitiesAnnexure2_p.pdf',
        },
      ],
    },
    {
      code: 'TEAM',
      title: 'Trade Enablement & Marketing (TEAM) under RAMP',
      category: 'Digital Enablement',
      issuingAuthority: 'MSME (GoI) / RAMP Programme',
      mandatory: false,
      description:
        'TEAM supports MSMEs with digital commerce enablement, branding, market linkages, cataloging, and platform onboarding to expand domestic and global reach.',
      eligibility: 'MSMEs registered on Udyam; additional conditions as per state/implementing guidelines.',
      process:
        'Apply via designated portals/implementing agencies, undergo onboarding, complete cataloging/branding/market-readiness activities, avail mentoring and linkages.',
      benefits: 'Improved market access, digital presence, brand readiness, potential sales growth.',
      deadlines: 'As per current RAMP/TEAM programme window; check active state/PIA notifications.',
      features: [
        'Digital cataloging & storefronts',
        'Branding & marketing support',
        'Platform onboarding and linkages',
      ],
      tags: ['digital', 'market access', 'capacity building'],
      references: [
        {
          label: 'Approved MSME TEAM Guidelines (uploaded PDF)',
          filename: 'Approved-msme-team-guidelines.pdf',
        },
      ],
    },
    {
      code: 'CBAM',
      title: 'EU Carbon Border Adjustment Mechanism',
      category: 'Trade & Carbon Mechanisms',
      issuingAuthority: 'European Union',
      mandatory: true,
      description:
        'CBAM addresses carbon leakage by equalizing carbon costs on certain imports into the EU. Importers must report embedded emissions and purchase CBAM certificates.',
      eligibility:
        'EU importers of covered goods; exporters to EU (including Indian MSMEs) need emissions data to support importer reporting.',
      process:
        'Quantify product-level embedded emissions as per CBAM methodologies, supply data to EU importer, and prepare for certificate pricing when fully in force.',
      benefits:
        'Sustained EU market access, carbon transparency, incentive to decarbonize supply chains.',
      deadlines: 'Transitional phase reporting began Oct 2023; full implementation phases continue per EU regulations.',
      features: [
        'Embedded emissions reporting',
        'CBAM certificates for covered sectors',
        'Transitional reporting → pricing phases',
      ],
      tags: ['trade', 'carbon', 'EU'],
      references: [
        {
          label: 'CBAM Regulation Summary (uploaded PDF)',
          filename: 'summary-of-the-cbam-regulation.pdf',
        },
      ],
    },
  ];

  for (const s of schemes) {
    await prisma.scheme.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
  }

  console.log('Schemes seeded: BRSR, TEAM, CBAM');
}

async function main() {
  await seedFrameworks();
  await seedSchemes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
