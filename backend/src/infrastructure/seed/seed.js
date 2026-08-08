'use strict';

const crypto = require('crypto');
const User = require('../../domain/entities/User');
const { Ad } = require('../../domain/entities/Ad');
const { generateId } = require('../../shared/utils/id');
const { PASSWORD_SALT } = require('../../config/env');

function hash(plain) {
  return crypto.createHash('sha256').update(PASSWORD_SALT + plain).digest('hex');
}

async function seed({ userRepository, adRepository }) {
  const existing = await userRepository.findByEmail('demo@ecocampus.edu');
  if (existing) return;

  const users = [
    new User({
      id: generateId('usr'),
      name: 'Ana Silva',
      email: 'demo@ecocampus.edu',
      password: hash('demo1234'),
      university: 'USP',
      course: 'Engenharia Civil',
      avatar: 'https://i.pravatar.cc/200?u=demo@ecocampus.edu',
      favorites: []
    }),
    new User({
      id: generateId('usr'),
      name: 'Bruno Costa',
      email: 'bruno@ecocampus.edu',
      password: hash('bruno1234'),
      university: 'UNICAMP',
      course: 'Ciência da Computação',
      avatar: 'https://i.pravatar.cc/200?u=bruno@ecocampus.edu',
      favorites: []
    }),
    new User({
      id: generateId('usr'),
      name: 'Camila Rocha',
      email: 'camila@ecocampus.edu',
      password: hash('camila1234'),
      university: 'UFRJ',
      course: 'Medicina',
      avatar: 'https://i.pravatar.cc/200?u=camila@ecocampus.edu',
      favorites: []
    })
  ];

  for (const u of users) await userRepository.create(u);

  const [ana, bruno, camila] = users;

  const ads = [
    new Ad({
      id: generateId('ad'),
      title: 'Cálculo Vol. 1 — James Stewart (8ª ed.)',
      description: 'Livro em ótimo estado, apenas anotações a lápis nos primeiros capítulos. Ideal para engenharias e exatas.',
      category: 'Livros',
      price: 80,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
      advertiser: ana.name,
      userId: ana.id,
      views: 34
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Jaleco branco tamanho M',
      description: 'Jaleco pouco usado, tamanho M, sem manchas. Perfeito para aulas práticas de laboratório.',
      category: 'Jalecos',
      price: 45,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      advertiser: camila.name,
      userId: camila.id,
      views: 21
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Kit de resistores + protoboard',
      description: 'Kit completo com 100 resistores variados, jumpers e protoboard 830 pontos. Serviu bem em Eletrônica I.',
      category: 'Componentes Eletrônicos',
      price: 35,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      advertiser: bruno.name,
      userId: bruno.id,
      views: 58
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Calculadora HP 50g',
      description: 'HP 50g em perfeito funcionamento, com capa e manual. Bateria nova.',
      category: 'Calculadoras',
      price: 350,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
      advertiser: bruno.name,
      userId: bruno.id,
      views: 102
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Apostilas de Anatomia Humana',
      description: 'Coletânea de apostilas de anatomia com resumos e ilustrações. Doação para quem estiver começando o ciclo básico.',
      category: 'Apostilas',
      price: 0,
      type: 'donation',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
      advertiser: camila.name,
      userId: camila.id,
      views: 71
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Mesa de escritório dobrável',
      description: 'Mesa dobrável usada por 1 ano. Ótima para home office ou apartamento pequeno. Retirar no local.',
      category: 'Móveis',
      price: 120,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      advertiser: ana.name,
      userId: ana.id,
      views: 18
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Fichários e canetas — kit escritório',
      description: 'Kit com 3 fichários A4, canetas coloridas e post-its. Doação para quem precisar.',
      category: 'Escritório',
      price: 0,
      type: 'donation',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      advertiser: ana.name,
      userId: ana.id,
      views: 12
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Xerox de Bioquímica — Lehninger (capítulos 1–10)',
      description: 'Xerox encadernado dos capítulos essenciais de bioquímica.',
      category: 'Xerox',
      price: 25,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      advertiser: camila.name,
      userId: camila.id,
      views: 43
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Multímetro digital Minipa ET-1002',
      description: 'Multímetro em ótimo estado com pontas de prova novas. Ideal para engenharia elétrica.',
      category: 'Equipamentos',
      price: 90,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1581092918484-8313fdad63e9?auto=format&fit=crop&w=800&q=80',
      advertiser: bruno.name,
      userId: bruno.id,
      views: 27
    }),
    new Ad({
      id: generateId('ad'),
      title: 'Livro de Álgebra Linear — Boldrini',
      description: 'Clássico da graduação. Poucas anotações, capa preservada.',
      category: 'Livros',
      price: 55,
      type: 'sale',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      advertiser: bruno.name,
      userId: bruno.id,
      views: 39
    })
  ];

  for (const a of ads) await adRepository.create(a);

  // eslint-disable-next-line no-console
  console.log('[seed] Base populada com 3 usuários e 10 anúncios de exemplo.');
  // eslint-disable-next-line no-console
  console.log('[seed] Login demo: demo@ecocampus.edu / demo1234');
}

module.exports = seed;

if (require.main === module) {
  const buildPersistence = require('../persistence/buildPersistence');
  const { userRepository, adRepository, driver, filePath } = buildPersistence();
  // eslint-disable-next-line no-console
  console.log(`[seed] driver=${driver}  path=${filePath}`);
  seed({ userRepository, adRepository }).then(() => process.exit(0));
}
