import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DOMAIN_DATA = [
  {
    code: 'IT',
    name: 'IT & Software Services',
    description: 'Information technology, software development, cloud computing, and digital transformation services',
    keywords: JSON.stringify([
      'cloud computing', 'artificial intelligence', 'machine learning', 'cybersecurity',
      'software development', 'devops', 'blockchain', 'data science', 'web development',
      'mobile app development', 'SaaS', 'API development', 'microservices', 'kubernetes',
      'AWS', 'Azure', 'digital transformation', 'IT consulting', 'software as a service',
      'enterprise software'
    ]),
    icon: '💻',
    color: '#3B82F6'
  },
  {
    code: 'Healthcare',
    name: 'Healthcare & MedTech',
    description: 'Healthcare technology, medical devices, telemedicine, and digital health solutions',
    keywords: JSON.stringify([
      'telemedicine', 'healthcare technology', 'medical devices', 'electronic health records',
      'patient care', 'healthcare AI', 'medical diagnostics', 'health monitoring',
      'digital health', 'healthcare analytics', 'medical imaging', 'clinical trials',
      'pharmaceutical', 'healthcare software', 'remote patient monitoring', 'healthcare data',
      'medical equipment', 'healthcare innovation', 'personalized medicine', 'health tech'
    ]),
    icon: '🏥',
    color: '#EF4444'
  },
  {
    code: 'EV',
    name: 'Electric Vehicles',
    description: 'Electric vehicle technology, EV infrastructure, battery systems, and sustainable transportation',
    keywords: JSON.stringify([
      'electric vehicles', 'EV charging', 'battery technology', 'electric cars',
      'EV infrastructure', 'charging stations', 'electric mobility', 'EV adoption',
      'lithium battery', 'electric vehicle market', 'EV sales', 'Tesla', 'electric SUV',
      'EV range', 'fast charging', 'electric vehicle battery', 'EV technology',
      'green transportation', 'zero emission vehicles', 'electric vehicle charging network'
    ]),
    icon: '⚡',
    color: '#10B981'
  },
  {
    code: 'OTT',
    name: 'OTT & Media Platforms',
    description: 'Over-the-top streaming services, digital content platforms, and online entertainment',
    keywords: JSON.stringify([
      'streaming services', 'video on demand', 'OTT platform', 'content streaming',
      'digital entertainment', 'streaming media', 'online video', 'subscription video',
      'streaming content', 'OTT services', 'video streaming platform', 'digital content',
      'streaming apps', 'media streaming', 'online entertainment', 'streaming technology',
      'video platform', 'OTT market', 'streaming subscriptions', 'digital media'
    ]),
    icon: '📺',
    color: '#8B5CF6'
  },
  {
    code: 'Biotech',
    name: 'Biotech & Life Sciences',
    description: 'Biotechnology, genetic engineering, drug discovery, and life sciences innovation',
    keywords: JSON.stringify([
      'biotechnology', 'gene therapy', 'CRISPR', 'biopharmaceuticals',
      'genetic engineering', 'biotech research', 'molecular biology', 'biotech innovation',
      'precision medicine', 'biotech startups', 'drug discovery', 'biotech industry',
      'genomics', 'proteomics', 'cell therapy', 'biotech products', 'biological research',
      'biotech development', 'synthetic biology', 'biotech investment'
    ]),
    icon: '🧬',
    color: '#F59E0B'
  },
  {
    code: 'AgriTech',
    name: 'AgriTech (Precision Agriculture)',
    description: 'Agricultural technology, precision farming, smart agriculture, and tea garden management',
    keywords: JSON.stringify([
      'precision agriculture', 'smart farming', 'agricultural technology', 'farm automation',
      'crop monitoring', 'agricultural drones', 'IoT agriculture', 'farm management software',
      'agricultural sensors', 'agritech solutions', 'tea plantation management',
      'tea garden technology', 'tea cultivation', 'tea production', 'tea quality monitoring',
      'tea harvesting technology', 'tea processing', 'tea estate management',
      'tea industry innovation', 'tea garden automation', 'sustainable tea farming',
      'tea crop analytics', 'vertical farming', 'hydroponics', 'agricultural AI'
    ]),
    icon: '🌱',
    color: '#059669'
  },
  {
    code: 'Restaurant',
    name: 'Restaurants & FoodTech',
    description: 'Restaurant technology, food delivery platforms, kitchen automation, and food service innovation',
    keywords: JSON.stringify([
      'restaurant technology', 'food delivery', 'restaurant management', 'online ordering',
      'restaurant POS', 'food service', 'restaurant software', 'menu management',
      'restaurant operations', 'food tech', 'restaurant automation', 'kitchen management',
      'restaurant analytics', 'table reservation', 'restaurant marketing', 'food ordering app',
      'restaurant inventory', 'cloud kitchen', 'ghost kitchen', 'restaurant delivery',
      'QR code menu', 'contactless dining', 'restaurant CRM', 'food service technology',
      'restaurant innovation'
    ]),
    icon: '🍽️',
    color: '#EC4899'
  }
];

async function seedDomains() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql2.createConnection(process.env.DATABASE_URL);

    console.log('Seeding domains...');
    
    for (const domainData of DOMAIN_DATA) {
      try {
        await connection.execute(
          `INSERT INTO domains (code, name, description, keywords, icon, color)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           keywords = VALUES(keywords),
           icon = VALUES(icon),
           color = VALUES(color)`,
          [
            domainData.code,
            domainData.name,
            domainData.description,
            domainData.keywords,
            domainData.icon,
            domainData.color
          ]
        );
        console.log(`✓ Seeded domain: ${domainData.name}`);
      } catch (error) {
        console.error(`✗ Error seeding ${domainData.name}:`, error.message);
      }
    }

    console.log('\n✅ Domain seeding completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding domains:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedDomains();
