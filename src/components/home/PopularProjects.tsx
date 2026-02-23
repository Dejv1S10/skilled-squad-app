import { useNavigate } from 'react-router-dom';

import handymanImg from '@/assets/images/handyman.jpg';
import cleaningImg from '@/assets/images/cleaning.jpg';
import gardenImg from '@/assets/images/garden.jpg';
import movingImg from '@/assets/images/moving.jpg';
import techImg from '@/assets/images/tech.jpg';
import craftImg from '@/assets/images/craft.jpg';
import careImg from '@/assets/images/care.jpg';
import autoImg from '@/assets/images/auto.jpg';

const projects = [
  { title: 'Montáž nábytku', category: 'handyman', image: handymanImg, price: 'od 350 Kč' },
  { title: 'Úklid domácnosti', category: 'cleaning', image: cleaningImg, price: 'od 300 Kč' },
  { title: 'Údržba zahrady', category: 'garden', image: gardenImg, price: 'od 400 Kč' },
  { title: 'Pomoc se stěhováním', category: 'moving', image: movingImg, price: 'od 500 Kč' },
  { title: 'IT a Smart Home', category: 'tech', image: techImg, price: 'od 450 Kč' },
  { title: 'Truhlářské práce', category: 'craft', image: craftImg, price: 'od 500 Kč' },
  { title: 'Péče o seniory', category: 'care', image: careImg, price: 'od 300 Kč' },
  { title: 'Autoservis', category: 'auto', image: autoImg, price: 'od 400 Kč' },
];

export function PopularProjects() {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-16">
      <div className="container">
        <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
          Populární služby
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <button
              key={project.title}
              onClick={() => navigate(`/search?q=${encodeURIComponent(project.title)}&category=${project.category}`)}
              className="group overflow-hidden rounded-xl text-left transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="bg-card p-3">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
