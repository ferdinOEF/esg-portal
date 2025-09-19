import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.framework.upsert({
    where: { code: 'SDG' },
    update: {},
    create: {
      code: 'SDG',
      title: 'UN Sustainable Development Goals',
      description: 'Mapping company actions to relevant SDG targets.',
      requirements: {
        create: [
          { code: 'SDG-12', title: 'Responsible Consumption & Production', description: 'Waste reduction and circularity practices' },
          { code: 'SDG-13', title: 'Climate Action', description: 'GHG inventory and mitigation plan' },
          { code: 'SDG-14', title: 'Life Below Water', description: 'Marine impact mitigation' },
        ]
      }
    }
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
        ]
      }
    }
  });

  console.log('Seed complete');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
