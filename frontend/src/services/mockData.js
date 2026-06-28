// Mock data for development

export const mockStats = {
  total_photos: 1248,
  analyzed_photos: 1180,
  completion_rate: 0.945,
  delta_total_photos_pct: 12.5
};

export const mockDistribution = [
  { name: 'Excavation', value: 320 },
  { name: 'Concrete', value: 285 },
  { name: 'Electrical', value: 210 },
  { name: 'Finishing', value: 185 },
  { name: 'Safety', value: 180 },
  { name: 'Other', value: 68 }
];

export const mockTimeline = [
  { date: 'Dec 17', count: 45 },
  { date: 'Dec 18', count: 52 },
  { date: 'Dec 19', count: 38 },
  { date: 'Dec 20', count: 65 },
  { date: 'Dec 21', count: 48 },
  { date: 'Dec 22', count: 70 },
  { date: 'Dec 23', count: 55 },
  { date: 'Dec 24', count: 42 }
];

export const mockImages = Array.from({ length: 20 }, (_, i) => ({
  image_id: `img-${i + 1}`,
  thumbnail_url: `https://picsum.photos/400/300?random=${i + 1}`,
  image_url: `https://picsum.photos/1200/900?random=${i + 1}`,
  uploaded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  taken_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: ['approved', 'review', 'pending'][Math.floor(Math.random() * 3)],
  category: ['Excavation', 'Concrete', 'Electrical', 'Finishing', 'Safety'][Math.floor(Math.random() * 5)],
  description: [
    'Construction site showing concrete foundation work in progress',
    'Excavation equipment operating in the designated area',
    'Electrical conduit installation on the second floor',
    'Safety equipment visible, workers wearing PPE',
    'Interior finishing work with drywall installation',
    'Concrete pouring operation with proper safety measures'
  ][Math.floor(Math.random() * 6)],
  ai_status: 'done',
  score: 0.85 + Math.random() * 0.15
}));

export const mockTopCategories = [
  { category: 'Excavation', count: 320, percentage: 25.6 },
  { category: 'Concrete', count: 285, percentage: 22.8 },
  { category: 'Electrical', count: 210, percentage: 16.8 },
  { category: 'Finishing', count: 185, percentage: 14.8 },
  { category: 'Safety', count: 180, percentage: 14.4 },
  { category: 'Other', count: 68, percentage: 5.4 }
];
