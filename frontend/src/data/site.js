export const SITE = {
  name: 'ARHICA',
  full: 'AfriResilience Hub for Inclusive Climate Action',
  tagline: 'Building resilience. Leaving no one behind.',
  address: 'Kisumu City, Lake Victoria Basin, Kenya',
  phone: '+254 728 697 188',
  phoneRaw: '+254728697188',
  email: 'info@arhica.org',
  inbox: 'info@arhica.org',
  paybill: '522533',
  account: '8074844',
  socials: [
    { icon: 'fa-brands fa-square-x-twitter', label: 'X', href: 'https://x.com/Arhicake26' },
    { icon: 'fab fa-facebook-f', label: 'Facebook', href: 'https://www.facebook.com/share/14PScUybsmw/' },
    { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: 'https://www.linkedin.com/in/afriresilience-hub-for-inclusive-climate-action-5673483a4' },
    { icon: 'fab fa-instagram', label: 'Instagram', href: 'https://www.instagram.com/arhi.cakis/' },
  ],
};

export const NAV = [
  { label: 'About', to: '/about' },
  {
    label: 'Programmes', to: '/programmes',
    children: [
      { label: 'All programmes', to: '/programmes' },
      { label: 'Sustainable Aquaculture', to: '/programmes#fish-cages' },
      { label: 'Root Crops (OFSP)', to: '/programmes#ofsp' },
      { label: 'Apiculture', to: '/programmes#apiculture' },
      { label: 'Environmental Restoration', to: '/programmes#restoration' },
      { label: 'Training and Capacity Building', to: '/programmes#Training' },
      { label: 'GESI', to: '/programmes#gesi' },
      { label: 'SamakiLog', to: '/programmes#samakilog' },
    ],
  },
  {
    label: 'Organization', to: '/organization/board',
    children: [
      { label: 'Board of Directors', to: '/organization/board' },
      { label: 'Management', to: '/organization/management' },
      { label: 'Teams & Departments', to: '/organization/teams' },
    ],
  },
  {
    label: 'Media', to: '/stories',
    children: [
      { label: 'Stories & News', to: '/stories' },
      { label: 'Events', to: '/events' },
      { label: 'Videos', to: '/videos' },
      { label: 'Gallery', to: '/gallery' },
    ],
  },
  { label: 'Contact', to: '/contact' },
];

export const STATS = [
  { icon: 'fa-users', value: 1000, suffix: '+', label: 'Youth engaged' },
  { icon: 'fa-diagram-project', value: 8, suffix: '', label: 'Programmes' },
  { icon: 'fa-handshake', value: 10, suffix: '+', label: 'Community partners' },
  { icon: 'fa-earth-africa', value: 7, suffix: '+', label: 'SDGs targeted' },
];

export const PROBLEMS = [
  { icon: 'fa-temperature-half', title: 'Climate change threat', text: 'Threatening fisheries, agriculture and livelihoods.' },
  { icon: 'fa-user-slash', title: 'Youth unemployment', text: 'Rising unemployment and underemployment among youth.' },
  { icon: 'fa-water', title: 'Underutilized blue economy', text: 'The vast potential of Lake Victoria is going untapped.' },
  { icon: 'fa-ban', title: 'Excluded from decisions', text: 'Communities are locked out of climate governance.' },
  { icon: 'fa-tree', title: 'Environmental degradation', text: 'The Lake Victoria ecosystem is under severe stress.' },
  { icon: 'fa-utensils', title: 'Food insecurity', text: 'Poverty and hunger are deepening across communities.' },
];

export const DIRECTION = [
  { icon: 'fa-eye', title: 'Our Vision', text: 'An Africa where climate resilience and food systems are inclusive, just and community-led — thriving communities where everyone, especially the most vulnerable, actively shapes their climate-resilient future.' },
  { icon: 'fa-bullseye', title: 'Our Mission', featured: true, text: 'To advance inclusive climate action by strengthening community resilience, transforming food systems, and promoting climate justice through evidence-based, community-led solutions. We bridge local innovation and global climate agendas.' },
  { icon: 'fa-hands-holding-circle', title: 'Our Values', text: 'Inclusivity, community ownership, evidence-based action, transparency and climate justice guide everything we do. Lasting change comes from within communities, not imposed from outside.' },
];

export const IMPACT = [
  { icon: 'fa-briefcase', title: 'Decent jobs', text: 'Employment and self-employment for youth in the blue economy and green sectors.' },
  { icon: 'fa-leaf', title: 'Climate resilience', text: 'Climate-resilient livelihoods and food systems for long-term sustainability.' },
  { icon: 'fa-chart-line', title: 'Economic growth', text: 'Inclusive growth and enterprise development in vulnerable communities.' },
  { icon: 'fa-seedling', title: 'Sustainability', text: 'Healthier ecosystems across the Lake Victoria Basin.' },
  { icon: 'fa-volume-high', title: 'Community voices', text: 'Amplifying community voices in climate governance and policy-making.' },
  { icon: 'fa-venus-mars', title: 'Gender equity', text: 'Gender equality and social inclusion across all programmes and partnerships.' },
];

export const PROGRAMMES = [
  {
    id: 'samakilog', badge: 'Digital Innovation', color: 'lake',
    title: 'SamakiLog Digital Application',
    summary: 'SamakiLog is an innovative mobile and computer application empowering the blue economy across the Lake Victoria Basin through smart, data-driven fisheries management. With over 190 users, the platform is growing into a digital hub that connects fisheries stakeholders, strengthens informed decision-making, and promotes sustainable fishing practices. By harnessing technology and accessible data, SamakiLog aims to improve fisheries management, support fishing communities, enhance resource conservation, and unlock new opportunities for a more productive, resilient, and sustainable blue economy.',
    images: ['samakilog4.jpg', 'samakilog1.jpg', 'pop.png'],
    tags: ['Digital Records', 'Market Linkages', 'Youth Tech'],
    cta: { label: 'View app', href: 'https://fishcatchlog-75077.web.app/', external: true },
  },
  {
    id: 'ofsp', badge: 'Crop Production', color: 'forest',
    title: 'Climate-Resilient Root Crops (OFSP)',
    summary: 'ARHICA is advancing Orange-Fleshed Sweet Potato (OFSP) as a promising, nutrition-sensitive agribusiness opportunity for young people and smallholder farmers. Currently in the implementation and pilot-testing phase, the programme promotes a high-yield, low-input crop rich in vitamin A, with the potential to strengthen food security, improve livelihoods, and create sustainable income opportunities',
    detail: 'Through improved production systems, access to quality planting materials, and value-addition initiatives, ARHICA is laying the foundation for a stronger OFSP value chain. Emerging partnerships and market linkages with processors such as Getonganya OFSP Processing Factory aim to support aggregation, processing, and commercialization. By promoting OFSP flour as an alternative to imported wheat flour, the programme seeks to unlock local enterprise opportunities, empower farmers and youth, and contribute to a more resilient and inclusive agricultural economy',
    indicators: ['Youths and farmers trained in OFSP production', 'Acreage under root crops and adoption of improved varieties', 'Volume of OFSP supplied to processors and markets', 'Value addition (OFSP flour, baked products)', 'Household nutrition and dietary diversification'],
    impact: 'Climate-resilient farmers, diversified incomes, better nutrition, less dependency on imported wheat and stronger local agro-processing.',
    images: ['potato 2.jpg', 'potato 3.jpg', 'potato 4.jpg', 'potato 5.jpg'],
    tags: ['Employment', 'Agriculture', 'Smallholder farmers'],
    cta: { label: 'Get involved', href: '/contact?topic=partner' },
  },
  {
    id: 'fish-cages', badge: 'Aquaculture', color: 'lake',
    title: 'Sustainable Fish Cage Enterprises',
    summary: 'Our Fish Cage Aquaculture Programme in Ongukwa promotes sustainable fish farming, food security, and livelihood development through a facility rental arrangement with RIOFish Farm. The project has achieved a key milestone by stocking over 8,000 tilapia fingerlings. ',
    images: ['fishcage1.jpeg', 'fishcage2.jpeg', 'fishcage3.jpeg', 'fishcage4.jpeg', 'fishcage5.jpeg', 'fishcage6.jpeg' ],
    tags: ['Employment', 'Food Security', 'Lake Victoria'],
    cta: { label: 'Get involved', href: '/contact?topic=partner' },
  },
  {
    id: 'apiculture', badge: 'Apiculture', color: 'coral',
    title: 'Apiculture Production (Beekeeping)',
    summary: 'A climate-smart venture engaging youth in income generation while promoting biodiversity. Western and Nyanza regions offer rich river systems and flora ideal for beekeeping.',
    detail: 'ARHICA is currently in the research phase, engaging with different beekeeping farms to identify reliable partners and source quality bees suitable for sustainable beekeeping in the Western and Nyanza regions of Kenya. These regions offer promising opportunities due to their diverse flora and ecological conditions.Through this initiative, ARHICA aims to explore opportunities for youth participation in beekeeping through practical training, modern beekeeping technologies, honey and beeswax processing, and market linkages. The long-term vision is to create green livelihood opportunities for young people while promoting pollination, biodiversity conservation and ecosystem health.',
    indicators: ['Youths train apiculture enterprises', 'Modern apiaries established and managed', 'Volume and value of honey and beeswax marketed', 'Market access, value addition and cooperatives', 'Biodiversity enhancement outcomes'],
    impact: 'More youth in sustainable agriculture, diversified income, resilient households and enhanced biodiversity.',
    images: ['bee1.jpg', 'bee2.jpg', 'bee3.jpg', 'bee4.jpg'],
    tags: ['Sustainable Agriculture', 'Biodiversity'],
    cta: { label: 'Support apiculture', href: '/contact?topic=partner' },
  },
  {
    id: 'restoration', badge: 'Conservation', color: 'amber',
    title: 'Environmental Restoration Partnerships',
    summary: 'Reforestation, wetland recovery and landscape rehabilitation anchored in community participation — engaging schools, youth groups and local institutions as stewards of nature.',
    indicators: ['Trees planted and survival rates', 'Hectares of land restored', 'Community participation in restoration', 'Biodiversity recovery and reduced soil erosion'],
    impact: 'Revived ecosystems, stronger climate resilience and communities actively safeguarding their environment.',
    images: ['v.jpg'],
    tags: ['Ecosystems', 'Conservation', 'Community'],
    cta: { label: 'Join efforts', href: '/contact?topic=partner' },
  },
  {
    id: 'gesi', badge: 'GESI', color: 'coral',
    title: 'Gender Equality & Social Inclusion',
    summary: 'We champion equitable access to opportunity by empowering women, youth and marginalized groups through training, advocacy and inclusive programming.',
    indicators: ['Participation of women and marginalized groups', 'Access to economic opportunities and resources', 'Representation in leadership and decision-making', 'Reduction in gender and social inequalities'],
    impact: 'Inclusive communities, reduced disparities and stronger social cohesion.',
    images: ['gendero.jpg'],
    tags: ['Gender', 'Inclusion', 'Human Rights'],
    cta: { label: 'Support GESI', href: '/contact?topic=partner' },
  },
  {
    id: 'Training', badge: 'Training and Capacity Building', color: 'forest',
    title: 'Training and Capacity Building',
    summary: 'ARHICA promotes climate change adaptation, environmental conservation education, leadership and governance development, youth empowerment, sustainable livelihoods, entrepreneurship, and community-based disaster risk reduction through skills transfer, mentorship, innovation and capacity building. The organization also supports institutional strengthening, research, documentation, knowledge management and climate resilience through workshops, seminars, field demonstrations and community engagement to foster sustainable development and inclusive environmental action.',
    indicators: ['Individuals trained on climate-smart practices', 'Adoption of renewable energy and sustainable behaviours', 'Community climate-action initiatives established', 'Improved disaster preparedness'],
    impact: 'Informed communities, reduced climate vulnerability and widespread sustainable practice.',
    images: ['fishcage6.jpeg'],
    tags: ['Mass Education', 'Inclusivity'],
    cta: { label: 'Join efforts', href: '/contact?topic=partner' },
  },
];

export const ABOUT_IMAGES = ['sily.jpg', 'community.jpeg', 'DSC_0913.jpg', 'slide3.jpg', 'eldon2.jpg', 'eldon4.jpg', 'eldon5.jpg', 'lawren.jpg'];
export const PROBLEM_IMAGES = ['climatechange.jpeg', 'underutilization.jpg'];
