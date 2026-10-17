// minAge/maxAge in months
export const books = [
  { id: 'caterpillar', title: 'The Very Hungry Caterpillar', author: 'Eric Carle', isbn: '9780399226908', minAge: 6, maxAge: 48, tags: ['animals', 'food', 'counting'], price: 899 },
  { id: 'goodnight-moon', title: 'Goodnight Moon', author: 'Margaret Wise Brown', isbn: '9780064430173', minAge: 0, maxAge: 36, tags: ['bedtime', 'calm'], price: 799 },
  { id: 'brown-bear', title: 'Brown Bear, Brown Bear, What Do You See?', author: 'Bill Martin Jr.', isbn: '9780805047905', minAge: 6, maxAge: 36, tags: ['animals', 'colors'], price: 849 },
  { id: 'gruffalo', title: 'The Gruffalo', author: 'Julia Donaldson', isbn: '9780142403877', minAge: 24, maxAge: 72, tags: ['animals', 'adventure', 'funny'], price: 999 },
  { id: 'wild-things', title: 'Where the Wild Things Are', author: 'Maurice Sendak', isbn: '9780060254926', minAge: 30, maxAge: 84, tags: ['adventure', 'bedtime', 'feelings'], price: 1099 },
  { id: 'guess-how-much', title: 'Guess How Much I Love You', author: 'Sam McBratney', isbn: '9780763641757', minAge: 0, maxAge: 48, tags: ['bedtime', 'feelings', 'animals'], price: 899 },
  { id: 'color-monster', title: 'The Color Monster', author: 'Anna Llenas', isbn: '9780316450010', minAge: 24, maxAge: 72, tags: ['feelings', 'colors'], price: 1199 },
  { id: 'chicka', title: 'Chicka Chicka Boom Boom', author: 'Bill Martin Jr.', isbn: '9781442450707', minAge: 12, maxAge: 60, tags: ['letters', 'funny'], price: 799 },
  { id: 'dont-let-pigeon', title: "Don't Let the Pigeon Drive the Bus!", author: 'Mo Willems', isbn: '9780786819881', minAge: 24, maxAge: 84, tags: ['funny', 'vehicles', 'animals'], price: 999 },
  { id: 'little-blue-truck', title: 'Little Blue Truck', author: 'Alice Schertle', isbn: '9780152056612', minAge: 12, maxAge: 48, tags: ['vehicles', 'animals', 'friendship'], price: 899 },
  { id: 'dinosaur-roar', title: 'Dinosaur Roar!', author: 'Paul Stickland', isbn: '9780140556490', minAge: 12, maxAge: 48, tags: ['dinosaurs', 'funny'], price: 699 },
  { id: 'llama-red-pajama', title: 'Llama Llama Red Pajama', author: 'Anna Dewdney', isbn: '9780670059836', minAge: 18, maxAge: 60, tags: ['bedtime', 'feelings', 'animals'], price: 899 },
];

export function recommend({ ageMonths, interests = [] }) {
  return books
    .map((b) => {
      const ageFit = ageMonths >= b.minAge && ageMonths <= b.maxAge;
      const matches = b.tags.filter((t) => interests.includes(t)).length;
      return { ...b, score: (ageFit ? 10 : 0) + matches * 3, matches };
    })
    .filter((b) => b.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
