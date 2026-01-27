import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import lawnMowingVideo from '@/assets/videos/lawn-mowing.mp4';
import furnitureAssemblyVideo from '@/assets/videos/furniture-assembly.mp4';
import cleaningVideo from '@/assets/videos/cleaning.mp4';
import movingVideo from '@/assets/videos/moving.mp4';

const videos = [
  { src: lawnMowingVideo, label: 'Zahrada' },
  { src: furnitureAssemblyVideo, label: 'Kutilství' },
  { src: cleaningVideo, label: 'Úklid' },
  { src: movingVideo, label: 'Stěhování' },
];

export function SearchHero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {videos.map((video, index) => (
          <video
            key={video.src}
            src={video.src}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              index === currentVideoIndex && !isTransitioning
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          />
        ))}
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/90" />
      </div>

      {/* Video indicator dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {videos.map((video, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentVideoIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              index === currentVideoIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/50 text-foreground hover:bg-background/70'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                index === currentVideoIndex ? 'bg-primary-foreground' : 'bg-muted-foreground'
              }`}
            />
            {video.label}
          </button>
        ))}
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground drop-shadow-sm md:text-5xl lg:text-6xl">
            Najděte spolehlivého{' '}
            <span className="text-primary">pomocníka</span> pro vaše domácí práce
          </h1>
          <p className="mb-10 text-lg text-muted-foreground drop-shadow-sm md:text-xl">
            Od zahradních prací po stěhování – spojíme vás s ověřenými pracovníky ve vašem okolí.
          </p>

          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Co potřebujete udělat? (např. posekání trávy)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 bg-background/95 pl-12 text-lg shadow-lg backdrop-blur-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-lg shadow-lg">
              Hledat
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
