import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';

// UNIQUE IMAGES PER ARTICLE - NO REPEATING
const ARTICLE_IMAGES = [
  { hero: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80' },
  { 
  hero: 'https://plus.unsplash.com/premium_photo-1679917506585-2c7b89054610?w=1920&q=80', 
  inline1: 'https://plus.unsplash.com/premium_photo-1679917506585-2c7b89054610?w=1200&q=80', 
  inline2: 'https://plus.unsplash.com/premium_photo-1679917506585-2c7b89054610?w=800&q=80' 
},
  { hero: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1556817411-58c45dd94e8c?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80', inline1: 'https://images.unsplash.com/photo-1587040273238-9ba47c714796?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1578355375869-7f2e4b28c4e0?w=800&q=80' },
  { hero: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80&crop=entropy', inline1: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200&q=80', inline2: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80' },
];

const getImages = (index) => {
  // Always return a valid image object
  const imageSet = ARTICLE_IMAGES[index % ARTICLE_IMAGES.length];
  return imageSet;
};

function Editorial() {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await articleService.getArticles('', 1);
      setArticles(response.data || []);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadArticle = (article, index) => {
    navigate(`/editorial/${article.slug || article._id}`, { state: { articleIndex: index } });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-primary/60 font-mono text-sm">LOADING EDITORIAL...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-12 py-8 z-50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-display italic text-[48px] text-primary mb-2">
            The Editorial
          </div>
          <div className="font-serif text-[16px] text-primary/60">
            A curated collection of Test cricket's finest stories
          </div>
        </motion.div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div
        className="absolute inset-0 pt-[180px] pb-[40px] overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex gap-8 px-12 h-full">
          {articles.map((article, index) => {
            const images = getImages(index);
            
            return (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex-shrink-0 w-[500px] h-full relative group"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Card */}
                <div className="relative h-full rounded-2xl overflow-hidden">
                  {/* Background Image */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${images.hero})` }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className="font-mono text-[10px] text-accent tracking-[0.4em] mb-3">
                        {article.category?.toUpperCase() || 'ANALYSIS'}
                      </div>
                      
                      <h2 className="font-display italic text-[36px] text-primary leading-[1.1] mb-4">
                        {article.title}
                      </h2>
                      
                      <p className="font-serif text-[15px] text-primary/70 leading-[1.7] mb-6 line-clamp-3">
                        {article.excerpt || article.content?.substring(0, 150) + '...'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-accent flex items-center justify-center font-display text-accent text-xs">
                            {article.author?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU'}
                          </div>
                          <div>
                            <div className="font-serif text-[13px] text-primary">
                              {article.author || 'Staff Writer'}
                            </div>
                            <div className="font-mono text-[10px] text-primary/50">
                              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={() => handleReadArticle(article, index)}
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-accent text-[13px] font-mono tracking-wider"
                        >
                          READ
                          <ArrowRight size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-accent/0 group-hover:border-accent/30 rounded-2xl transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
        <div className="font-mono text-[10px] text-primary/40 tracking-wider">
          SWIPE TO EXPLORE
        </div>
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary/40"
        >
          →
        </motion.div>
      </div>
    </div>
  );
}

export default Editorial;
