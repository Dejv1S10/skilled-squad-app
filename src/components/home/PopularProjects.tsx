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
  { title: 'Montáž nábytku', desc: 'Montáž nábytku, sestavení regálů a skříní, opravy.', category: 'handyman', image: handymanImg, rating: 4.8 },
  { title: 'Úklid kuchyně', desc: 'Hloubkový úklid kuchyně, mytí spotřebičů, dezinfekce.', category: 'cleaning', image: cleaningImg, rating: 4.7 },
  { title: 'Sekání trávníku', desc: 'Sekání trávníku, stříhání živých plotů, údržba zahrady, péče.', category: 'garden', image: gardenImg, rating: 4.6 },
  { title: 'Stěhování domova', desc: 'Stěhování domova, stěhování safe, stěhování vešpůstu podami.', category: 'moving', image: movingImg, rating: 4.5 },
  { title: 'IT a Smart Home', desc: 'Nastavení Wi-Fi, Smart Home, servis PC a TV.', category: 'tech', image: techImg, rating: 4.9 },
  { title: 'Truhlářské práce', desc: 'Zakázková výroba nábytku, opravy, pokládka podlah.', category: 'craft', image: craftImg, rating: 4.7 },
  { title: 'Péče o seniory', desc: 'Doprovod, nákupy, pomoc v domácnosti, doučování.', category: 'care', image: careImg, rating: 4.8 },
  { title: 'Autoservis', desc: 'Přezutí pneumatik, mytí auta, drobné opravy.', category: 'auto', image: autoImg, rating: 4.4 },
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
              className="group relative overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="mb-1 flex items-center gap-1">
                  {[1, 2].map(i => (
                    <svg key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                  <span className="text-xs font-semibold text-yellow-400">{project.rating}</span>
                </div>
                <h3 className="font-bold text-white">{project.title}</h3>
                <p className="mt-0.5 text-xs text-white/70 line-clamp-2">{project.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
